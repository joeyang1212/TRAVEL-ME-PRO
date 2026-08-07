export type GeminiPart = { text?: string; inlineData?: { mimeType: string; data: string } };

export type GeminiRequest = {
  parts: GeminiPart[];
  maxOutputTokens?: number;
};

export class GeminiConfigError extends Error {
  constructor(message = "Gemini API 尚未完成伺服器設定。") {
    super(message);
    this.name = "GeminiConfigError";
  }
}

export class GeminiApiError extends Error {
  status: number;
  detail?: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = "GeminiApiError";
    this.status = status;
    this.detail = detail;
  }
}

const DEFAULT_MODEL = "gemini-3.6-flash";

function buildModelCandidates(configuredModel?: string) {
  const candidates = [configuredModel?.trim(), DEFAULT_MODEL, "gemini-flash-latest"]
    .filter((value): value is string => Boolean(value));
  return [...new Set(candidates)];
}

export function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const model = configuredModel || DEFAULT_MODEL;
  return { apiKey, model, configuredModel, configured: Boolean(apiKey) };
}

export function getGeminiSafeStatus() {
  const { apiKey, model, configuredModel, configured } = getGeminiConfig();
  return {
    configured,
    model,
    configuredModel: configuredModel || null,
    fallbackModel: DEFAULT_MODEL,
    keyLength: apiKey?.length ?? 0,
    runtime: "nodejs",
  };
}

function shouldTryFallback(status: number, providerMessage: string) {
  return status === 404 || /no longer available|not found|not supported|unavailable/i.test(providerMessage);
}

export async function generateGemini({ parts, maxOutputTokens = 1200 }: GeminiRequest) {
  const { apiKey, configuredModel } = getGeminiConfig();
  if (!apiKey) throw new GeminiConfigError();

  const models = buildModelCandidates(configuredModel);
  let lastError: { status: number; data: any; model: string; providerMessage: string } | null = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { maxOutputTokens },
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      const answer = data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("")
        .trim();

      if (!answer) throw new GeminiApiError(502, "Gemini 沒有回傳可顯示的內容。", data);
      return { answer, model };
    }

    const providerMessage = data?.error?.message ? String(data.error.message) : "";
    lastError = { status: response.status, data, model, providerMessage };

    if (shouldTryFallback(response.status, providerMessage) && model !== models[models.length - 1]) {
      console.warn(`Gemini model ${model} unavailable, trying fallback model.`);
      continue;
    }

    break;
  }

  const status = lastError?.status ?? 502;
  const data = lastError?.data ?? {};
  const model = lastError?.model ?? DEFAULT_MODEL;
  const providerMessage = lastError?.providerMessage ?? "";

  const message = status === 429
    ? "Gemini 免費額度或速率暫時已達上限，請稍後再試。"
    : status === 400
      ? `Gemini 請求格式或模型設定有誤${providerMessage ? `：${providerMessage}` : ""}`
      : status === 403
        ? `Gemini API Key 權限被拒絕${providerMessage ? `：${providerMessage}` : ""}`
        : status === 404
          ? `找不到可用的 Gemini 模型（最後嘗試 ${model}）${providerMessage ? `：${providerMessage}` : ""}`
          : `Gemini 回覆失敗（HTTP ${status}）${providerMessage ? `：${providerMessage}` : ""}`;

  throw new GeminiApiError(status, message, data);
}
