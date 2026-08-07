export type GeminiPart = { text?: string; inlineData?: { mimeType: string; data: string } };

export type GeminiRequest = {
  parts: GeminiPart[];
  temperature?: number;
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

export function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  return { apiKey, model, configured: Boolean(apiKey) };
}

export function getGeminiSafeStatus() {
  const { apiKey, model, configured } = getGeminiConfig();
  return {
    configured,
    model,
    keyLength: apiKey?.length ?? 0,
    runtime: "nodejs",
  };
}

export async function generateGemini({ parts, temperature = 0.2, maxOutputTokens = 1200 }: GeminiRequest) {
  const { apiKey, model } = getGeminiConfig();
  if (!apiKey) throw new GeminiConfigError();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: { temperature, maxOutputTokens },
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const providerMessage = data?.error?.message ? String(data.error.message) : "";
    const message = response.status === 429
      ? "Gemini 免費額度或速率暫時已達上限，請稍後再試。"
      : response.status === 400
        ? `Gemini 請求格式或模型設定有誤${providerMessage ? `：${providerMessage}` : ""}`
        : response.status === 403
          ? `Gemini API Key 權限被拒絕${providerMessage ? `：${providerMessage}` : ""}`
          : response.status === 404
            ? `找不到 Gemini 模型 ${model}${providerMessage ? `：${providerMessage}` : ""}`
            : `Gemini 回覆失敗（HTTP ${response.status}）${providerMessage ? `：${providerMessage}` : ""}`;
    throw new GeminiApiError(response.status, message, data);
  }

  const answer = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || "")
    .join("")
    .trim();

  if (!answer) throw new GeminiApiError(502, "Gemini 沒有回傳可顯示的內容。", data);
  return { answer, model };
}
