import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "OfficialUM1",
    timestamp: new Date().toISOString(),
  });
}
