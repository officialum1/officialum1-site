import { NextResponse } from "next/server";
import { getRankMathConfig } from "@/lib/rank-math-server";
import { rankMathSeoScore } from "@/lib/rank-math-config";

export const dynamic = "force-dynamic";

/** Public read-only Rank Math config for frontend / schema consumers */
export async function GET() {
  try {
    const config = await getRankMathConfig();
    return NextResponse.json({
      config,
      score: rankMathSeoScore(config),
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: "Failed to load Rank Math settings" }, { status: 500 });
  }
}
