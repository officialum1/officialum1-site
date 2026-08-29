import { NextRequest, NextResponse } from "next/server";
import { AGENT_AUTH_BLOCK } from "@/lib/agent-readiness/agent-auth";
import { AGENT_SITE } from "@/lib/agent-readiness/config";

export const dynamic = "force-dynamic";

const RESOURCE_METADATA_URL = `${AGENT_SITE}/.well-known/oauth-protected-resource`;

function authChallenge() {
  return `Bearer resource_metadata="${RESOURCE_METADATA_URL}"`;
}

export async function GET() {
  return NextResponse.json({
    ...AGENT_AUTH_BLOCK,
    documentation: `${AGENT_SITE}/auth.md`,
  });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", error_description: "JSON body required" },
      { status: 400, headers: { "WWW-Authenticate": authChallenge() } }
    );
  }

  const identityType = String(body.identity_type || body.type || "anonymous");

  if (identityType === "anonymous") {
    return NextResponse.json({
      credential_type: "api_key",
      api_key: `oum_agent_${Date.now().toString(36)}`,
      scopes: ["shop:read"],
      token_endpoint: `${AGENT_SITE}/api/oauth/token`,
    });
  }

  return NextResponse.json(
    {
      error: "unsupported_identity_type",
      error_description: "Provide identity_type anonymous or a valid ID-JAG assertion",
      supported: AGENT_AUTH_BLOCK.identity_types_supported,
    },
    { status: 400, headers: { "WWW-Authenticate": authChallenge() } }
  );
}
