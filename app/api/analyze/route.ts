import { NextResponse } from "next/server";
import { GeminiApiError, GeminiConfigError, generateGemini } from "../../../lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 30;

const instructions = {
  shopping: "辨識商品、品牌、型號、材質、規格、容量與圖片中的價格。比較紐西蘭與台灣購買價值，分析價差、CP值、建議數量、預算與行李重量。不得虛構售價、庫存或折扣。",
  wine: "辨識酒莊、酒款、年份、產區、葡萄品種、酒精濃度與容量。提供風味、搭餐、保存、托運與帶回建議。不得虛構評分、獎項、價格或台灣通路。",
  translate: "完整辨識圖片文字並翻譯成繁體中文。保留價格、幣別、數字、容量與單位，整理成分、用法、過敏原與警告。看不清楚必須標示。",
  guide: "根據照片辨識景點，提供簡介、歷史、停留時間、拍照建議及安全提醒。不得虛構即時營業時間、廁所距離、停車或店家資訊。",
  receipt: "辨識收據的店名、日期、品項、數量、單價、稅額、折扣、總額與幣別，換算台幣並建議消費分類。看不清楚的欄位必須標示。",
  photo: "你是手機旅遊攝影教練。分析照片構圖、水平、人物比例、光線、背景雜物與拍攝角度。給 100 分制評分，列出優點、三項改善，以及可立即重拍的具體指示。不可辨識或推測照片中人物身分。"
} as const;

type Mode = keyof typeof instructions;

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mode = body.mode as Mode;
    if (!instructions[mode]) {
      return NextResponse.json({ error: "未知分析模式。" }, { status: 400 });
    }

    const image = parseDataUrl(String(body.imageDataUrl || ""));
    if (!image) {
      return NextResponse.json({ error: "請上傳 JPG、PNG 或 WEBP 圖片。" }, { status: 400 });
    }

    const prompt = `
你是 Travel ME 的旅行 AI 助手。
任務：${instructions[mode]}

使用者問題：${String(body.question || "請直接分析照片").slice(0, 1000)}
旅行背景：${String(body.tripContext || "").slice(0, 500)}
剩餘預算：TWD ${Number(body.remainingBudget) || 0}
剩餘行李：${Number(body.remainingWeight) || 0} kg
參考匯率：1 NZD ≈ TWD ${Number(body.exchangeRate) || 19.5}

回答要求：
1. 使用繁體中文。
2. 先給一句明確結論與五星推薦。
3. 再用清楚小標題整理辨識結果、價格判斷、預算／重量影響、建議與注意事項。
4. 價格若不是由圖片或使用者提供，必須標示「估算」或「無法確認」。
5. 不確定的資訊不可猜測。
6. 不要宣稱已查到即時庫存、即時售價或即時評分，除非圖片內明確可見。
`;

    const result = await generateGemini({
      parts: [
        { text: prompt },
        { inlineData: { mimeType: image.mimeType, data: image.data } }
      ],
      temperature: 0.2,
      maxOutputTokens: 1800,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GeminiConfigError) {
      return NextResponse.json({ error: "AI 服務尚未連線。請檢查 Production 的 GEMINI_API_KEY，並重新部署。", code: "GEMINI_NOT_CONFIGURED" }, { status: 503 });
    }
    if (error instanceof GeminiApiError) {
      console.error("Gemini analyze error", error.status, error.detail);
      return NextResponse.json({ error: error.message, code: "GEMINI_PROVIDER_ERROR", providerStatus: error.status }, { status: error.status === 429 ? 429 : 502 });
    }
    console.error(error);
    return NextResponse.json({ error: "Gemini 分析暫時失敗，請稍後再試。", code: "AI_ANALYZE_ERROR" }, { status: 500 });
  }
}
