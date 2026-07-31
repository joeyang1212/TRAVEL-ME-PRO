import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const instructions = {
  shopping: "辨識商品、品牌、型號、材質、規格、容量與圖片中的價格。比較紐西蘭與台灣購買價值，分析價差、CP值、建議數量、預算與行李重量。不得虛構售價或庫存。",
  wine: "辨識酒莊、酒款、年份、產區、葡萄品種、酒精濃度與容量。提供風味、搭餐、保存、托運與帶回建議。不得虛構評分、獎項或價格。",
  translate: "完整辨識圖片文字並翻譯成繁體中文。保留價格、幣別、數字、容量與單位，整理成分、用法、過敏原與警告。看不清楚必須標示。",
  guide: "根據照片辨識景點，提供簡介、歷史、停留時間、拍照建議及安全提醒。不得虛構即時營業時間、廁所距離、停車或店家資訊。",
  receipt: "辨識收據的店名、日期、品項、數量、單價、稅額、折扣、總額與幣別，換算台幣並建議消費分類。看不清楚的欄位必須標示。"
} as const;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "伺服器尚未設定 OPENAI_API_KEY。" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const mode = body.mode as keyof typeof instructions;
    if (!instructions[mode]) return NextResponse.json({ error: "未知分析模式。" }, { status: 400 });
    if (!/^data:image\/(jpeg|png|webp);base64,/i.test(body.imageDataUrl || "")) {
      return NextResponse.json({ error: "請上傳 JPG、PNG 或 WEBP 圖片。" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const context = `
你是 Travel ME 的旅行 AI 助手。${instructions[mode]}
使用者問題：${String(body.question || "請直接分析照片").slice(0, 1000)}
旅行背景：${String(body.tripContext || "").slice(0, 500)}
剩餘預算：TWD ${Number(body.remainingBudget) || 0}
剩餘行李：${Number(body.remainingWeight) || 0} kg
參考匯率：1 NZD ≈ TWD ${Number(body.exchangeRate) || 19.5}
請使用繁體中文，先給一句結論與五星推薦，再用清楚小標題整理。不確定的資訊不可猜測。`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      max_output_tokens: 1400,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: context },
          { type: "input_image", image_url: body.imageDataUrl, detail: "auto" }
        ]
      }]
    });

    return NextResponse.json({ answer: response.output_text || "AI 沒有回傳可顯示的結果。" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "AI 分析暫時失敗，請稍後再試。" }, { status: 500 });
  }
}
