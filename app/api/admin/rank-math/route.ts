import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { parseRankMathConfig, rankMathSeoScore } from "@/lib/rank-math-config";
import { getRankMathConfig, saveRankMathConfig } from "@/lib/rank-math-server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await getRankMathConfig();
    return NextResponse.json({ success: true, config, score: rankMathSeoScore(config) });
  } catch (e: unknown) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const config = parseRankMathConfig(body.config || body);
    await saveRankMathConfig(config);
    return NextResponse.json({ success: true, score: rankMathSeoScore(config) });
  } catch (e: unknown) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
