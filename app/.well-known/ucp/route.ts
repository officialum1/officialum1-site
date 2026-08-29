import { NextResponse } from "next/server";
import { UCP_PROFILE } from "@/lib/agent-readiness/payloads";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(UCP_PROFILE, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
