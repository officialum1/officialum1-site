import { NextResponse } from "next/server";
import { AGENT_SITE } from "@/lib/agent-readiness/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  return NextResponse.json({
    client_id: `agent_${Date.now().toString(36)}`,
    client_secret: `secret_${Math.random().toString(36).slice(2)}`,
    token_endpoint: `${AGENT_SITE}/api/oauth/token`,
    grant_types: ["client_credentials"],
  });
}
