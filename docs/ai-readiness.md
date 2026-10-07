# AI readiness

Scored with `postman spec ai-readiness` and `postman collection ai-readiness` (Postman CLI). The score estimates how reliably an AI agent can use an API: it is driven mostly by **complexity** (auth, error surface, parameters, pagination, rate limiting, nesting), adjusted by **documentation coverage**. Simpler and better documented scores higher.

Gate: every item must score at least **75**. Regenerate with `npm run ai-readiness`.

| Kind | Name | Score | Rating | Complexity | Doc coverage |
|---|---|---|---|---|---|
| spec | bets | **80** | Excellent | Simple | high |
| spec | geo-compliance | **80** | Excellent | Simple | high |
| spec | markets | **95** | Excellent | Simple | high |
| spec | player-limits | **80** | Excellent | Simple | high |
| spec | promotions | **80** | Excellent | Simple | high |
| spec | wallet | **80** | Excellent | Simple | high |
| collection | bets | **80** | Excellent | Simple | high |
| collection | e2e-championship-boost | **75** | Excellent | Simple | high |
| collection | geo-compliance | **85** | Excellent | Simple | high |
| collection | markets | **85** | Excellent | Simple | high |
| collection | player-limits | **85** | Excellent | Simple | high |
| collection | promotions | **85** | Excellent | Simple | high |
| collection | sportsbook-app-contract | **80** | Excellent | Simple | high |
| collection | test-suite | **80** | Excellent | Simple | medium |
| collection | wallet | **85** | Excellent | Simple | high |

## What the scorer recommends (deduplicated, verbatim from the CLI)

- Authentication is declared — make sure credential acquisition is also documented (where to obtain keys/tokens, scopes needed) so an agent operator can set up access.
- A broad error surface is documented — good. Make sure each error states whether it is recoverable (retry, fix input, re-auth) so agents can branch on it.
- Many distinct error codes are documented — keep them, and add a short handling hint per code so agents can map each to a strategy without guessing.
- Reduce parameter count, simplify nested object parameters, or document each parameter's role; AI selects parameters from descriptions.
- Save example responses with their headers (collection) or add `x-ratelimit-*` extensions (spec) so rate limiting can be detected.
- Flatten deeply-nested response schemas; AI agents struggle to navigate >5 levels of nesting reliably.
- Document 4xx/5xx response codes (spec) or save error-case example responses (collection).
- Large surface area: scope the AI agent to a focused subset of endpoints, or split the spec into smaller domains.
- Define response schemas (spec) or save example responses (collection) so structure can be measured.
- Save example responses on the collection so payload size can be measured.

## What we changed, and what we deliberately did not

- **Credential acquisition** is documented in every spec's security scheme and every collection: find the API in the catalog, request the resource group in Passport, wait for the owner's approval, use the `{{vault:...}}` reference.
- **Every error code carries a handling hint**: whether it is recoverable, and what a client or agent should do (fix input, re-authenticate, route through the proxy, or stop).
- **We tried adding a real rate limit** (600 requests a minute per key, `X-RateLimit-*` headers, `429` with `Retry-After`) because the scorer flagged rate limiting as undetectable. Scores dropped from 80 to 70: rate limiting counts as complexity an agent has to handle. The sandbox has no real need for one, so we took it out.
- **We kept the full error surface.** Fewer documented errors would score higher, but agents branch on those codes; removing them would trade real usefulness for points.
