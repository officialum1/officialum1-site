import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    error: "invalid_request",
    error_description: "Use POST with OAuth authorization code flow",
  }, { status: 400 });
}
