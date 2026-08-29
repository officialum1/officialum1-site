import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { x402PaymentRequired } from "@/lib/agent-readiness/payloads";

export async function GET(request: NextRequest) {
  const paymentSig =
    request.headers.get("PAYMENT-SIGNATURE") || request.headers.get("X-PAYMENT");

  if (!paymentSig) {
    const { paymentRequired, encoded } = x402PaymentRequired();
    return NextResponse.json(paymentRequired, {
      status: 402,
      headers: {
        "PAYMENT-REQUIRED": encoded,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const products = (await query(
      "SELECT id, name, price, platform, description, image FROM products ORDER BY id DESC LIMIT 50"
    )) as Record<string, unknown>[];

    const q = request.nextUrl.searchParams.get("q")?.toLowerCase();
    const filtered = q
      ? products.filter((p) => String(p.name || "").toLowerCase().includes(q))
      : products;

    return NextResponse.json({
      products: filtered.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        platform: p.platform,
        url: `https://officialum1.com/shop/${p.id}`,
      })),
    });
  } catch {
    return NextResponse.json({ products: [], note: "Catalog temporarily unavailable" });
  }
}
