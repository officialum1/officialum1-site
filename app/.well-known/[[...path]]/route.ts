import { NextResponse } from "next/server";
import { getWellKnownPayload } from "@/lib/agent-readiness/payloads";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path = [] } = await params;
  const key = path.join("/");
  const payload = getWellKnownPayload(key);

  if (!payload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (typeof payload.body === "string") {
    return new NextResponse(payload.body, {
      status: 200,
      headers: { "Content-Type": payload.contentType, "Cache-Control": "public, max-age=3600" },
    });
  }

  return NextResponse.json(payload.body, {
    status: 200,
    headers: {
      "Content-Type": payload.contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
