import { NextResponse } from "next/server";
import { WEB_BOT_AUTH_JWKS } from "@/lib/agent-readiness/payloads";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = JSON.stringify(WEB_BOT_AUTH_JWKS);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": String(Buffer.byteLength(body)),
      "Cache-Control": "public, max-age=86400, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
