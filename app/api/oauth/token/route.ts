import { NextRequest, NextResponse } from "next/server";
import { AGENT_SITE } from "@/lib/agent-readiness/config";

export const dynamic = "force-dynamic";

const RESOURCE_METADATA = `${AGENT_SITE}/.well-known/oauth-protected-resource`;

export async function POST(request: NextRequest) {
  const grantType = request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")
    ? (await request.formData()).get("grant_type")
    : (await request.json().catch(() => ({})) as { grant_type?: string }).grant_type;

  if (grantType === "client_credentials") {
    return NextResponse.json({
      access_token: `oum_at_${Date.now().toString(36)}`,
      token_type: "Bearer",
      expires_in: 3600,
      scope: "shop:read",
    });
  }

  return NextResponse.json(
    { error: "unsupported_grant_type" },
    {
      status: 400,
      headers: { "WWW-Authenticate": `Bearer resource_metadata="${RESOURCE_METADATA}"` },
    }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "method_not_allowed", token_endpoint: `${AGENT_SITE}/api/oauth/token` },
    { status: 405 }
  );
}
