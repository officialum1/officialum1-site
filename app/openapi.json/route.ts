import { NextResponse } from "next/server";
import { OPENAPI_SPEC } from "@/lib/agent-readiness/payloads";

export async function GET() {
  return NextResponse.json(OPENAPI_SPEC, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
