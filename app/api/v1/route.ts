import { NextResponse } from "next/server";
import { x402PaymentRequired } from "@/lib/agent-readiness/payloads";

export async function GET() {
  const { paymentRequired, encoded } = x402PaymentRequired();
  return NextResponse.json(paymentRequired, {
    status: 402,
    headers: {
      "PAYMENT-REQUIRED": encoded,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "PAYMENT-REQUIRED, PAYMENT-RESPONSE, PAYMENT-SIGNATURE",
    },
  });
}

export async function POST() {
  return GET();
}
