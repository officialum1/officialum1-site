import { NextRequest, NextResponse } from "next/server";
import { AGENT_SITE } from "@/lib/agent-readiness/config";
import { query } from "@/lib/db";

const TOOLS = [
  {
    name: "search_products",
    description: "Search OfficialUM1 digital products and accounts by keyword or category.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keyword (e.g., 'netflix', 'seo', 'canva', 'telegram')" },
        category: { type: "string", description: "Optional category filter" },
      },
    },
  },
  {
    name: "get_product_details",
    description: "Get comprehensive details and pricing for a specific product by ID.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: "number", description: "Product numeric ID" },
      },
      required: ["product_id"],
    },
  },
  {
    name: "list_services",
    description: "List all OfficialUM1 digital agency services, web development packages, and SEO offerings.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "search_knowledge_base",
    description: "Search OfficialUM1 knowledge base for guides, FAQs, and troubleshooting solutions.",
    inputSchema: {
      type: "object",
      properties: {
        keyword: { type: "string", description: "Search keyword for articles and help guides" },
      },
      required: ["keyword"],
    },
  },
  {
    name: "get_business_info",
    description: "Get OfficialUM1 business overview, official contact channels (WhatsApp, Telegram, Email), and agency capabilities.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "check_order_status",
    description: "Check the fulfillment and delivery status of an order using its order ID.",
    inputSchema: {
      type: "object",
      properties: {
        order_id: { type: "string", description: "Order ID (e.g., ORD-XXXXX)" },
      },
      required: ["order_id"],
    },
  },
];

export async function GET() {
  return NextResponse.json({
    name: "OfficialUM1 MCP Server",
    version: "2.0.0",
    protocol: "mcp",
    transport: "streamable-http",
    tools: TOOLS,
    site: AGENT_SITE,
    documentation: `${AGENT_SITE}/llms.txt`,
  });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const method = String(body.method || "");
  const id = body.id ?? 1;

  if (method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "OfficialUM1 MCP Server", version: "2.0.0" },
      },
    });
  }

  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: { tools: TOOLS },
    });
  }

  if (method === "tools/call") {
    const params = (body.params || {}) as { name?: string; arguments?: Record<string, any> };
    const toolName = params.name;
    const args = params.arguments || {};

    try {
      if (toolName === "list_services") {
        const services = [
          {
            title: "SEO Services Sahiwal & Global",
            url: `${AGENT_SITE}/services/seo-services-sahiwal`,
            description: "Technical, On-Page, Off-Page, and local SEO services with guaranteed keyword ranking.",
          },
          {
            title: "Custom Web Design & Next.js Development",
            url: `${AGENT_SITE}/services/web-design-sahiwal`,
            description: "Full-stack web application development, responsive UI/UX, and high-performance platforms.",
          },
          {
            title: "Digital Marketing & Brand Growth",
            url: `${AGENT_SITE}/services/digital-marketing-sahiwal`,
            description: "Targeted advertising, social media growth, lead generation, and analytics optimization.",
          },
          {
            title: "High Authority Guest Posting",
            url: `${AGENT_SITE}/services/guest-posting`,
            description: "Premium editorial guest posts with permanent do-follow backlinks on high-traffic websites.",
          },
          {
            title: "White-Label SEO Agency Solutions",
            url: `${AGENT_SITE}/services/white-label-seo`,
            description: "Turnkey scalable SEO and content solutions tailored for partnering digital agencies.",
          },
        ];
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(services, null, 2) }] },
        });
      }

      if (toolName === "get_business_info") {
        const info = {
          name: "OfficialUM1",
          founder: "Muhammad Umar Mumtaz",
          tagline: "Premier Digital Agency & Digital Products Platform",
          website: AGENT_SITE,
          shop: `${AGENT_SITE}/shop`,
          contact: {
            email: "support@officialum1.com",
            telegram: "@OfficialUM1",
            supportTicket: `${AGENT_SITE}/support`,
          },
          specialties: [
            "Next.js & Web App Engineering",
            "Data-Driven Search Engine Optimization (SEO)",
            "Verified Digital Accounts & Instant Tools",
            "High Authority Guest Posting & Link Building",
          ],
        };
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] },
        });
      }

      if (toolName === "search_products") {
        const q = String(args.query || "").trim();
        let products: any[] = [];
        try {
          if (q) {
            products = (await query(
              "SELECT id, name, price, sale_price, platform, stock, type, description FROM products WHERE name LIKE ? OR platform LIKE ? OR description LIKE ? LIMIT 20",
              [`%${q}%`, `%${q}%`, `%${q}%`]
            )) as any[];
          } else {
            products = (await query(
              "SELECT id, name, price, sale_price, platform, stock, type, description FROM products ORDER BY id DESC LIMIT 20"
            )) as any[];
          }
        } catch {
          const res = await fetch(`${AGENT_SITE}/api/products`, { cache: "no-store" }).catch(() => null);
          if (res?.ok) {
            const data = await res.json();
            const items = Array.isArray(data) ? data : data.products || [];
            products = q
              ? items.filter((p: any) =>
                  String(p.name || "").toLowerCase().includes(q.toLowerCase())
                )
              : items.slice(0, 20);
          }
        }

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(products, null, 2) }] },
        });
      }

      if (toolName === "get_product_details") {
        const productId = args.product_id;
        let product: any = null;
        try {
          const rows = (await query(
            "SELECT id, name, price, sale_price, platform, stock, type, description, created_at FROM products WHERE id = ? LIMIT 1",
            [productId]
          )) as any[];
          if (rows && rows.length > 0) product = rows[0];
        } catch {
          // fallback
        }

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: product
                  ? JSON.stringify(product, null, 2)
                  : JSON.stringify({ error: `Product with ID ${productId} not found.` }),
              },
            ],
          },
        });
      }

      if (toolName === "search_knowledge_base") {
        const keyword = String(args.keyword || "").trim();
        let articles: any[] = [];
        try {
          articles = (await query(
            "SELECT id, title, slug, category, views FROM knowledge_base WHERE (title LIKE ? OR content LIKE ?) AND is_published = TRUE LIMIT 10",
            [`%${keyword}%`, `%${keyword}%`]
          )) as any[];
        } catch {
          // fallback
        }

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(articles, null, 2) }] },
        });
      }

      if (toolName === "check_order_status") {
        const orderId = String(args.order_id || "").trim();
        let orderInfo: any = null;
        try {
          const rows = (await query(
            "SELECT orderId, amount, status, delivery_status, date FROM orders WHERE orderId = ? LIMIT 1",
            [orderId]
          )) as any[];
          if (rows && rows.length > 0) {
            orderInfo = {
              orderId: rows[0].orderId,
              amount: rows[0].amount,
              paymentStatus: rows[0].status,
              deliveryStatus: rows[0].delivery_status || "processing",
              orderDate: rows[0].date,
            };
          }
        } catch {
          // fallback
        }

        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: orderInfo
                  ? JSON.stringify(orderInfo, null, 2)
                  : JSON.stringify({ error: `Order '${orderId}' not found or verification pending.` }),
              },
            ],
          },
        });
      }

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Tool '${toolName}' not found` },
      });
    } catch (toolError: any) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32603, message: toolError?.message || "Internal error during tool execution" },
      });
    }
  }

  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: "Method not found" },
  });
}

