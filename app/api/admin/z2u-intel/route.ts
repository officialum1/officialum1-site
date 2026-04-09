import { NextResponse } from "next/server";
import { initDB, query } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

type DemandLevel = "High" | "Medium" | "Low";

type Z2UIntelResponse = {
  hotSearches: { keyword: string; demand: DemandLevel; competition: DemandLevel; opportunity: number }[];
  topOpportunity: {
    suggestedTitle: string;
    priceRange: string;
    pricingStrategy: string;
    seoDescription: string;
    rankingTips: string[];
  };
  quickWins: { action: string; impact: string }[];
  summary: string;
};

const SYSTEM_PROMPT = `You are a Z2U and G2G marketplace SEO analyst for a digital goods seller. 
Search the platform live right now and find real current data. 
Return ONLY valid JSON — no markdown, no preamble, no explanation. 
JSON structure must be exactly:
{
  "hotSearches": [
    { "keyword": "", "demand": "High|Medium|Low", "competition": "High|Medium|Low", "opportunity": 1-10 }
  ],
  "topOpportunity": {
    "suggestedTitle": "",
    "priceRange": "",
    "pricingStrategy": "",
    "seoDescription": "",
    "rankingTips": ["", "", ""]
  },
  "quickWins": [
    { "action": "", "impact": "" }
  ],
  "summary": ""
}`;

function buildUserPrompt(platform: string, category: string, game: string) {
  return `Search ${platform}.com right now. Find the top 8 hottest search keywords buyers are typing in ${category} for ${game}.

For each keyword analyze: how high is buyer demand, how much seller competition exists, and score the opportunity 1-10 (high demand + low competition = high score).

Then identify the single best listing I should create today based on a real gap in the market. Give me:
- The exact title buyers would search (copy the language real buyers use)
- A realistic price range based on what is currently selling
- A pricing strategy to beat the top 3 competitors
- An SEO-optimized description using the hottest keywords naturally
- 3 specific ranking tips for this exact listing

Also give 3 quick wins — specific things I can do right now to rank any existing listing higher.

Return only valid JSON matching the exact structure specified.`;
}

function extractJsonCandidate(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1).trim();
}

async function callAnthropic(platform: string, category: string, game: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false as const, error: "Missing ANTHROPIC_API_KEY" };
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(platform, category, game) }],
    }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message || json?.message || "Anthropic request failed";
    return { ok: false as const, error: msg };
  }

  const text = Array.isArray(json?.content)
    ? json.content
        .filter((c: any) => c?.type === "text" && typeof c?.text === "string")
        .map((c: any) => c.text)
        .join("")
    : "";

  return { ok: true as const, text };
}

export async function POST(req: Request) {
  try {
    const password = req.headers.get("x-admin-password");
    await initDB();

    // Robust Auth Strategy (match /api/admin/z2u)
    let isAuthorized = false;

    // 1) Auth via Environment Var
    if (password && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
      isAuthorized = true;
    }

    // 2) Auth via Database Setting (Fallback)
    if (!isAuthorized && password) {
      try {
        const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'admin_password'");
        if (rows?.length > 0 && password === rows[0].setting_value) {
          isAuthorized = true;
        }
      } catch (e) { }
    }

    // 3) User Session Context (Dashboard usage)
    if (!isAuthorized && await isAuthenticated()) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const platform = String(body?.platform || "").trim();
    const category = String(body?.category || "").trim();
    const game = String(body?.game || "").trim();

    if (!platform || !category || !game) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ai = await callAnthropic(platform, category, game);
    if (!ai.ok) {
      return NextResponse.json({ error: "Analysis failed, try again" }, { status: 500 });
    }

    const candidate = extractJsonCandidate(ai.text);
    if (!candidate) {
      return NextResponse.json({ error: "Analysis failed, try again" }, { status: 500 });
    }

    let parsed: Z2UIntelResponse;
    try {
      parsed = JSON.parse(candidate);
    } catch {
      return NextResponse.json({ error: "Analysis failed, try again" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Analysis failed, try again" }, { status: 500 });
  }
}

