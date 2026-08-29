import { llmsTxt, llmsFullTxt } from "@/lib/agent-readiness/config";

export async function GET() {
  return new Response(llmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
