import { AGENT_SITE } from "./config";

export const AGENT_AUTH_BLOCK = {
  skill: `${AGENT_SITE}/auth.md`,
  register_uri: `${AGENT_SITE}/api/agent/auth`,
  claim_uri: `${AGENT_SITE}/api/agent/auth/claim`,
  revocation_uri: `${AGENT_SITE}/api/agent/auth/revoke`,
  identity_types_supported: ["anonymous", "identity_assertion"],
  anonymous: {
    credential_types_supported: ["api_key", "access_token"],
    claim_uri: `${AGENT_SITE}/api/agent/auth/claim`,
  },
  identity_assertion: {
    assertion_types_supported: [
      "urn:ietf:params:oauth:token-type:id-jag",
      "verified_email",
    ],
    credential_types_supported: ["access_token", "api_key"],
    claim_uri: `${AGENT_SITE}/api/agent/auth/claim`,
  },
  events_supported: [
    "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked",
  ],
};

export const AUTH_MD_BODY = `# auth.md

OfficialUM1 agent registration for shop catalog and commerce APIs.

## Discovery

- Protected Resource Metadata: ${AGENT_SITE}/.well-known/oauth-protected-resource
- Authorization Server: ${AGENT_SITE}/.well-known/oauth-authorization-server
- Agent registration skill: ${AGENT_SITE}/auth.md

## Supported flows

### Agent verified (ID-JAG)

Agents with a trusted identity assertion exchange it at \`POST ${AGENT_SITE}/api/agent/auth\`.

### User claimed (verified email)

Agents start at \`POST ${AGENT_SITE}/api/agent/auth/claim\` and complete email verification.

### Anonymous

Anonymous agents register at \`POST ${AGENT_SITE}/api/agent/auth\` with \`identity_type: anonymous\`.

## Scopes

- \`shop:read\` — browse products
- \`shop:write\` — create checkout sessions
- \`profile\` — read basic profile

## Credentials

Use \`Authorization: Bearer <access_token>\` on protected routes after registration.

## Revocation

\`POST ${AGENT_SITE}/api/agent/auth/revoke\`
`;
