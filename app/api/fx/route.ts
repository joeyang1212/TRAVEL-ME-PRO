import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/NZD", {
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error("匯率服務暫時無法使用");
    const data = await response.json();
    const rate = Number(data?.rates?.TWD);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("未取得有效 NZD/TWD 匯率");

    return NextResponse.json({
      base: "NZD",
      quote: "TWD",
      rate,
      updatedAt: data?.time_last_update_utc ?? new Date().toISOString(),
      source: "ExchangeRate-API Open",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "匯率取得失敗" },
      { status: 503 },
    );
  }
}
