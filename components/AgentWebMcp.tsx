"use client";

import { useEffect } from "react";

type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
};

declare global {
  interface Navigator {
    modelContext?: {
      registerTool: (tool: WebMcpTool) => void;
      unregisterTool?: (name: string) => void;
    };
  }
}

export default function AgentWebMcp() {
  useEffect(() => {
    const mc = navigator.modelContext;
    if (!mc?.registerTool) return;

    const tools: WebMcpTool[] = [
      {
        name: "search_products",
        description: "Search OfficialUM1 shop for digital products.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search keyword" },
          },
        },
        execute: async (input) => {
          const q = String(input.query || "");
          const url = q
            ? `/api/v1/shop?q=${encodeURIComponent(q)}`
            : "/api/v1/shop";
          const res = await fetch(url, {
            headers: { "PAYMENT-SIGNATURE": "webmcp-demo" },
          });
          return res.json();
        },
      },
      {
        name: "get_site_info",
        description: "Return OfficialUM1 agent discovery endpoints.",
        inputSchema: { type: "object", properties: {} },
        execute: async () => ({
          site: "https://officialum1.com",
          apiCatalog: "https://officialum1.com/.well-known/api-catalog",
          mcp: "https://officialum1.com/mcp",
          llms: "https://officialum1.com/llms.txt",
        }),
      },
    ];

    tools.forEach((tool) => mc.registerTool(tool));

    return () => {
      tools.forEach((tool) => mc.unregisterTool?.(tool.name));
    };
  }, []);

  return null;
}
