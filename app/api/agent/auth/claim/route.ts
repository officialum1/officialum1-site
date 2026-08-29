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

  const email = String(body.email || "");
  if (!email.includes("@")) {
    return NextResponse.json(
      { error: "invalid_email", message: "email required for claim flow" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: "claim_pending",
    claim_id: `claim_${Date.now().toString(36)}`,
    message: "Verification code sent (demo). Complete at POST /api/agent/auth/claim/complete",
    complete_uri: `${AGENT_SITE}/api/agent/auth/claim/complete`,
  });
}
