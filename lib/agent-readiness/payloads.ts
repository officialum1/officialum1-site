import { createHash } from "crypto";
import { AGENT_ENDPOINTS, AGENT_SITE } from "./config";
import { AGENT_AUTH_BLOCK, AUTH_MD_BODY } from "./agent-auth";

/** Valid RSA-2048 public JWK for Web Bot Auth signature verification */
export const WEB_BOT_AUTH_JWKS = {
  keys: [
    {
      kty: "RSA",
      n: "3MStf4rgVDPYc5nw8YyKIIuCz8WUyvakIU8hXInoFTJ36UqzR12MXxcwBovwJAZD8x553XDoFI-EWeb-K2MYL3k74leAkIK3wblDa4A7pxCuTDP1R685PDs7G5T4TwyGBdRENE-M3GHbWXgvH-6mZ1AIsJbPCnVFaKaPImepXBrVReN6JJ_opGsAp8hvphbENM0PIGW57RQxtS4_6Qpr44ItNLxht8hsZeYZDUIgpnScfIa52Vf-50oFxrd4F4tsnrMaSR6CfwShPBYYbhyalRVwwwSV6YPqMuNeOreF9HszNMmU-Tps0p8q9M2061CzgNAN25EghMI7zlDCdx6GGw",
      e: "AQAB",
      kid: "officialum1-bot-auth-2026",
      use: "sig",
      alg: "RS256",
    },
  ],
};

export const MCP_SERVER_CARD = {
  serverInfo: {
    name: "OfficialUM1 Agent API",
    version: "1.0.0",
  },
  description:
    "OfficialUM1 shop catalog, SEO services, and site discovery tools for AI agents.",
  url: AGENT_ENDPOINTS.mcp,
  transport: {
    type: "streamable-http",
  },
  capabilities: {
    tools: true,
    resources: true,
  },
};

export const MCP_JSON = {
  serverInfo: MCP_SERVER_CARD.serverInfo,
  description: MCP_SERVER_CARD.description,
  url: AGENT_ENDPOINTS.mcp,
  transport: MCP_SERVER_CARD.transport,
  capabilities: MCP_SERVER_CARD.capabilities,
};

export const API_CATALOG = {
  linkset: [
    {
      anchor: AGENT_ENDPOINTS.shopApi,
      "service-desc": [
        { href: AGENT_ENDPOINTS.openapi, type: "application/json" },
        { href: AGENT_ENDPOINTS.mcpServerCard, type: "application/json" },
      ],
      "service-doc": [{ href: AGENT_ENDPOINTS.llmsFull, type: "text/plain" }],
      status: [{ href: AGENT_ENDPOINTS.health }],
    },
    {
      anchor: AGENT_ENDPOINTS.mcp,
      "service-desc": [{ href: AGENT_ENDPOINTS.mcpServerCard, type: "application/json" }],
    },
  ],
};

export const OAUTH_AUTHORIZATION_SERVER = {
  issuer: AGENT_SITE,
  authorization_endpoint: `${AGENT_SITE}/api/oauth/authorize`,
  token_endpoint: `${AGENT_SITE}/api/oauth/token`,
  jwks_uri: `${AGENT_SITE}/.well-known/http-message-signatures-directory`,
  registration_endpoint: `${AGENT_SITE}/api/oauth/register`,
  revocation_endpoint: `${AGENT_SITE}/api/agent/auth/revoke`,
  scopes_supported: ["openid", "profile", "shop:read", "shop:write"],
  response_types_supported: ["code"],
  grant_types_supported: [
    "authorization_code",
    "client_credentials",
    "urn:ietf:params:oauth:grant-type:jwt-bearer",
  ],
  token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
  code_challenge_methods_supported: ["S256"],
  agent_auth: AGENT_AUTH_BLOCK,
};

export const OPENID_CONFIGURATION = {
  ...OAUTH_AUTHORIZATION_SERVER,
  userinfo_endpoint: `${AGENT_SITE}/api/oauth/userinfo`,
  subject_types_supported: ["public"],
  id_token_signing_alg_values_supported: ["RS256"],
};

export const OAUTH_PROTECTED_RESOURCE = {
  resource: AGENT_SITE,
  authorization_servers: [AGENT_SITE],
  scopes_supported: ["openid", "profile", "shop:read", "shop:write"],
  bearer_methods_supported: ["header"],
  resource_documentation: `${AGENT_SITE}/auth.md`,
  agent_auth: AGENT_AUTH_BLOCK,
};

export const AUTH_MD = AUTH_MD_BODY;

export const A2A_AGENT_CARD = {
  name: "OfficialUM1 Commerce Agent",
  version: "1.0.0",
  description:
    "Helps AI agents discover OfficialUM1 digital products, SEO services, and checkout flows.",
  supportedInterfaces: [
    {
      url: AGENT_ENDPOINTS.mcp,
      protocol: "mcp-streamable-http",
    },
    {
      url: `${AGENT_SITE}/.well-known/agent-card.json`,
      protocol: "a2a-json",
    },
  ],
  capabilities: {
    streaming: false,
    pushNotifications: false,
    extensions: [
      {
        uri: "https://github.com/google-agentic-commerce/ap2/tree/v0.1",
        description:
          "OfficialUM1 merchant agent — accepts x402 and Stripe payments for digital products.",
        required: true,
        params: {
          roles: ["merchant"],
        },
      },
    ],
  },
  skills: [
    {
      id: "shop-catalog",
      name: "Shop Catalog",
      description: "Search and list digital products available for instant purchase.",
    },
    {
      id: "site-discovery",
      name: "Site Discovery",
      description: "Discover OfficialUM1 services, blog posts, and support resources.",
    },
  ],
  authentication: {
    schemes: ["oauth2"],
    oauth2: {
      authorizationServer: AGENT_ENDPOINTS.oauthServer,
    },
  },
};

const SHOP_SKILL_MD = `# Shop Catalog Skill

Search OfficialUM1 digital products and return pricing, platform, and purchase URLs.

## Endpoint

GET ${AGENT_ENDPOINTS.shopApi}?q={query}

## MCP tool

Use the \`search_products\` tool on ${AGENT_ENDPOINTS.mcp}.
`;

const SITE_SKILL_MD = `# Site Discovery Skill

Discover OfficialUM1 pages, services, and agent endpoints.

## Resources

- LLMs summary: ${AGENT_ENDPOINTS.llms}
- API catalog: ${AGENT_ENDPOINTS.apiCatalog}
- Sitemap: ${AGENT_ENDPOINTS.sitemap}
`;

function sha256(content: string): string {
  return `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;
}

export const AGENT_SKILLS = {
  shop: { name: "shop-catalog", content: SHOP_SKILL_MD },
  site: { name: "site-discovery", content: SITE_SKILL_MD },
};

export function agentSkillsIndex() {
  return {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: AGENT_SKILLS.shop.name,
        type: "skill-md",
        description: "Search OfficialUM1 shop products and pricing.",
        url: `${AGENT_SITE}/.well-known/agent-skills/shop-catalog/SKILL.md`,
        digest: sha256(AGENT_SKILLS.shop.content),
      },
      {
        name: AGENT_SKILLS.site.name,
        type: "skill-md",
        description: "Discover OfficialUM1 services and agent endpoints.",
        url: `${AGENT_SITE}/.well-known/agent-skills/site-discovery/SKILL.md`,
        digest: sha256(AGENT_SKILLS.site.content),
      },
    ],
  };
}

export const OPENAPI_SPEC = {
  openapi: "3.1.0",
  info: {
    title: "OfficialUM1 Agent Commerce API",
    version: "1.0.0",
    description: "Machine-readable catalog and checkout APIs for AI agents.",
  },
  servers: [{ url: AGENT_SITE }],
  paths: {
    "/api/v1/shop": {
      get: {
        operationId: "listProducts",
        summary: "List or search shop products",
        parameters: [
          {
            name: "q",
            in: "query",
            schema: { type: "string" },
            description: "Search query",
          },
        ],
        responses: {
          "200": {
            description: "Product list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    products: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          },
          "402": { description: "Payment required for premium catalog access" },
        },
        "x-payment-info": {
          intent: "charge",
          method: "stripe",
          amount: "100",
          currency: "USD",
          description: "Premium agent catalog access",
        },
      },
    },
    "/api/v1/checkout": {
      post: {
        operationId: "createCheckout",
        summary: "Create a checkout session",
        responses: {
          "200": { description: "Checkout session created" },
          "402": { description: "Payment required" },
        },
        "x-payment-info": {
          intent: "session",
          method: "stripe",
          amount: "0",
          currency: "USD",
          description: "Checkout session for cart items",
        },
      },
    },
  },
  "x-service-info": {
    name: "OfficialUM1 Shop",
    categories: ["digital-goods", "seo-services"],
  },
};

export const UCP_PROFILE = {
  ucp: {
    version: "2026-04-08",
    services: {
      "com.officialum1.shopping": [
        {
          version: "2026-04-08",
          transport: "mcp",
          endpoint: AGENT_ENDPOINTS.mcp,
          schema: AGENT_ENDPOINTS.mcpServerCard,
        },
        {
          version: "2026-04-08",
          transport: "rest",
          endpoint: `${AGENT_SITE}/api/v1`,
          schema: AGENT_ENDPOINTS.openapi,
        },
      ],
    },
    capabilities: {
      checkout: [{ version: "2026-04-08" }],
      cart: [{ version: "2026-04-08" }],
      "catalog-search": [{ version: "2026-04-08" }],
    },
    payment_handlers: {
      "com.stripe.card": [{ id: "stripe-default", version: "2026-04-08" }],
      "org.x402.exact": [{ id: "x402-base-usdc", version: "2026-04-08" }],
    },
  },
  signing_keys: WEB_BOT_AUTH_JWKS.keys,
  supported_versions: {
    "2026-04-08": `${AGENT_SITE}/.well-known/ucp`,
  },
};

export const ACP_DISCOVERY = {
  protocol: {
    name: "acp",
    version: "1.0.0",
  },
  api_base_url: `${AGENT_SITE}/api/v1`,
  transports: ["https", "mcp-streamable-http"],
  capabilities: {
    services: ["product-search", "checkout", "order-tracking"],
  },
  discovery: {
    openapi: AGENT_ENDPOINTS.openapi,
    mcp: AGENT_ENDPOINTS.mcpServerCard,
  },
};

export function x402PaymentRequired() {
  const paymentRequired = {
    x402Version: 2,
    accepts: [
      {
        scheme: "exact",
        network: "base",
        maxAmountRequired: "10000",
        resource: AGENT_ENDPOINTS.shopApi,
        description: "OfficialUM1 agent API access",
        mimeType: "application/json",
        payTo: "0x0000000000000000000000000000000000000001",
        maxTimeoutSeconds: 300,
      },
    ],
  };
  const encoded = Buffer.from(JSON.stringify(paymentRequired)).toString("base64");
  return { paymentRequired, encoded };
}

export function getWellKnownPayload(path: string): { body: unknown; contentType: string } | null {
  switch (path) {
    case "api-catalog":
      return { body: API_CATALOG, contentType: "application/linkset+json" };
    case "oauth-authorization-server":
      return { body: OAUTH_AUTHORIZATION_SERVER, contentType: "application/json" };
    case "openid-configuration":
      return { body: OPENID_CONFIGURATION, contentType: "application/json" };
    case "oauth-protected-resource":
      return { body: OAUTH_PROTECTED_RESOURCE, contentType: "application/json" };
    case "http-message-signatures-directory":
      return { body: WEB_BOT_AUTH_JWKS, contentType: "application/json" };
    case "mcp/server-card.json":
    case "mcp.json":
      return { body: MCP_SERVER_CARD, contentType: "application/json" };
    case "agent-card.json":
      return { body: A2A_AGENT_CARD, contentType: "application/json" };
    case "agent-skills/index.json":
      return { body: agentSkillsIndex(), contentType: "application/json" };
    case "ucp":
      return { body: UCP_PROFILE, contentType: "application/json" };
    case "acp.json":
      return { body: ACP_DISCOVERY, contentType: "application/json" };
    case "agent-skills/shop-catalog/SKILL.md":
      return { body: AGENT_SKILLS.shop.content, contentType: "text/markdown; charset=utf-8" };
    case "agent-skills/site-discovery/SKILL.md":
      return { body: AGENT_SKILLS.site.content, contentType: "text/markdown; charset=utf-8" };
    default:
      return null;
  }
}
