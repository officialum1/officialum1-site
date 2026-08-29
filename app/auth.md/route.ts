import { AUTH_MD } from "@/lib/agent-readiness/payloads";

export async function GET() {
  return new Response(AUTH_MD, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
