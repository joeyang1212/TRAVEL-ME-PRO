import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const allowedModes = new Set(["shopping", "wine", "guide"]);

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "伺服器尚未設定 GEMINI_API_KEY。" }, { status: 503 });
  }

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

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: `${systemText}\n\n${prompt}` }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini assistant error", response.status, data);
      const message = response.status === 429
        ? "Gemini 免費額度或速率暫時已達上限，請稍後再試。"
        : "Gemini 回覆失敗，請稍後再試。";
      return NextResponse.json({ error: message }, { status: response.status === 429 ? 429 : 502 });
    }

    const answer = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      return NextResponse.json({ error: "Gemini 沒有回傳可顯示的內容。" }, { status: 502 });
    }

    return NextResponse.json({ answer, model });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "AI 助手暫時失敗，請稍後再試。" }, { status: 500 });
  }
}
