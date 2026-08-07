import { NextResponse } from "next/server";
import { getGeminiSafeStatus } from "../../../lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = getGeminiSafeStatus();
  return NextResponse.json({
    ...status,
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    timestamp: new Date().toISOString(),
  }, {
    headers: { "cache-control": "no-store" },
  });
}
