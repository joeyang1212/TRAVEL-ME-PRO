import { NextResponse } from "next/server";
import { GeminiApiError, GeminiConfigError, generateGemini } from "../../../lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 30;

const allowedModes = new Set(["shopping", "wine", "guide"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mode = String(body.mode || "");
    const prompt = String(body.prompt || "").trim();

    if (!allowedModes.has(mode)) {
      return NextResponse.json({ error: "不支援的 AI 模式。" }, { status: 400 });
    }
    if (!prompt) {
      return NextResponse.json({ error: "缺少 AI Prompt。" }, { status: 400 });
    }
    if (prompt.length > 5000) {
      return NextResponse.json({ error: "Prompt 過長，請縮短內容。" }, { status: 400 });
    }

    const systemText = mode === "shopping"
      ? "你是 Travel ME 的紐西蘭購物顧問。使用繁體中文，先給一句結論，再整理價格、預算、重量、送禮與注意事項。不得虛構即時庫存、促銷、台灣通路或未提供的價格。"
      : mode === "wine"
        ? "你是 Travel ME 的紐西蘭酒類顧問。使用繁體中文，先給一句結論，再整理風格、搭餐、送禮、預算、重量與托運注意事項。不得虛構年份、評分、獎項、即時庫存或未提供的價格。"
        : "你是 Travel ME 的紐西蘭景點導覽顧問。使用繁體中文，依使用者提供的景點資料，整理歷史背景、地質或形成原因、文化意義、現場觀察重點、建議停留時間與拍照提醒。不得虛構即時開放狀態、交通異動、天氣或未提供的歷史細節；不確定時要明確說明。";

    const result = await generateGemini({
      parts: [{ text: `${systemText}\n\n${prompt}` }],
      maxOutputTokens: 1200,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GeminiConfigError) {
      return NextResponse.json({ error: "AI 服務尚未連線。請檢查 Production 的 GEMINI_API_KEY，並重新部署。", code: "GEMINI_NOT_CONFIGURED" }, { status: 503 });
    }
    if (error instanceof GeminiApiError) {
      console.error("Gemini assistant error", error.status, error.detail);
      return NextResponse.json({ error: error.message, code: "GEMINI_PROVIDER_ERROR", providerStatus: error.status }, { status: error.status === 429 ? 429 : 502 });
    }
    console.error(error);
    return NextResponse.json({ error: "AI 助手暫時失敗，請稍後再試。", code: "AI_ASSISTANT_ERROR" }, { status: 500 });
  }
}
