export const AGENT_SITE = "https://officialum1.com";

export const AGENT_ENDPOINTS = {
  apiCatalog: `${AGENT_SITE}/.well-known/api-catalog`,
  mcpServerCard: `${AGENT_SITE}/.well-known/mcp/server-card.json`,
  mcp: `${AGENT_SITE}/mcp`,
  agentCard: `${AGENT_SITE}/.well-known/agent-card.json`,
  agentSkills: `${AGENT_SITE}/.well-known/agent-skills/index.json`,
  oauthServer: `${AGENT_SITE}/.well-known/oauth-authorization-server`,
  oauthProtected: `${AGENT_SITE}/.well-known/oauth-protected-resource`,
  openapi: `${AGENT_SITE}/openapi.json`,
  llms: `${AGENT_SITE}/llms.txt`,
  llmsFull: `${AGENT_SITE}/llms-full.txt`,
  sitemap: `${AGENT_SITE}/sitemap.xml`,
  ucp: `${AGENT_SITE}/.well-known/ucp`,
  acp: `${AGENT_SITE}/.well-known/acp.json`,
  health: `${AGENT_SITE}/api/health`,
  shopApi: `${AGENT_SITE}/api/v1/shop`,
} as const;

export function buildLinkHeader(): string {
  return [
    `</.well-known/api-catalog>; rel="api-catalog"`,
    `</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"`,
    `</llms-full.txt>; rel="service-doc"; type="text/plain"`,
    `</llms.txt>; rel="describedby"; type="text/plain"`,
    `</sitemap.xml>; rel="sitemap"; type="application/xml"`,
    `</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"`,
  ].join(", ");
}

export function homepageMarkdown(): string {
  return `# OfficialUM1

> Premier digital agency — web development, SEO, social media, and instant digital product shop.

## About

OfficialUM1 (Muhammad Umar Mumtaz) provides web design, SEO services, guest posting, white-label SEO, and digital products with secure checkout.

## Key pages

- [Home](${AGENT_SITE}/)
- [Shop](${AGENT_SITE}/shop)
- [Services](${AGENT_SITE}/services)
- [Blog](${AGENT_SITE}/blog)
- [Contact](${AGENT_SITE}/contact)
- [FAQ](${AGENT_SITE}/faq)

## Agent discovery

- API Catalog: ${AGENT_ENDPOINTS.apiCatalog}
- MCP Server: ${AGENT_ENDPOINTS.mcp}
- Agent Skills: ${AGENT_ENDPOINTS.agentSkills}
- OpenAPI: ${AGENT_ENDPOINTS.openapi}

## Contact

- Website: ${AGENT_SITE}
- Email: support@officialum1.com
`;
}

export function llmsTxt(): string {
  return `# OfficialUM1

> Digital agency and e-commerce shop for SEO, web design, and instant digital products.

## Services

- [SEO Services Sahiwal](${AGENT_SITE}/services/seo-services-sahiwal)
- [SEO Services USA](${AGENT_SITE}/services/seo-services-usa)
- [SEO Services UK](${AGENT_SITE}/services/seo-services-uk)
- [Web Design Sahiwal](${AGENT_SITE}/services/web-design-sahiwal)
- [Social Media Sahiwal](${AGENT_SITE}/services/social-media-sahiwal)
- [Guest Posting](${AGENT_SITE}/services/guest-posting)
- [White-label SEO](${AGENT_SITE}/services/white-label-seo)
- [Outsource Web Development](${AGENT_SITE}/services/outsource-web-development)

## Shop

- [Browse Products](${AGENT_SITE}/shop)

## Agent endpoints

- [API Catalog](${AGENT_ENDPOINTS.apiCatalog})
- [MCP Server Card](${AGENT_ENDPOINTS.mcpServerCard})
- [Agent Skills](${AGENT_ENDPOINTS.agentSkills})
`;
}

export function llmsFullTxt(): string {
  return `${llmsTxt()}

## Full site map

- [Sitemap](${AGENT_ENDPOINTS.sitemap})

## Authentication

- [Auth Docs](${AGENT_SITE}/auth.md)
- [OAuth Protected](${AGENT_ENDPOINTS.oauthProtected})

## Commerce

- [UCP](${AGENT_ENDPOINTS.ucp})
- [ACP](${AGENT_ENDPOINTS.acp})
- [Payable API](${AGENT_ENDPOINTS.shopApi})
`;
}

