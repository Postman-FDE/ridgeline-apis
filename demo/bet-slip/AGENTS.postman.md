# AGENTS.md: bet-slip (with the Postman API Catalog)

> Demo swap-in for the re-run: `cp AGENTS.postman.md AGENTS.md`

Everything in the baseline AGENTS.md still applies. In addition:

## Before you write any client or business rule
1. **Check the Postman API Catalog first.** Use the Postman MCP server or the Postman CLI/skills to find
   existing services, owners, consumers and the *current* spec. Prefer an existing service to new code.
2. **The spec in the Catalog is the only source of truth.** If your memory, or a doc in this repo,
   disagrees with the spec, the spec wins. `docs/` in this repo can be stale.
3. **Never implement player-protection logic** (limits, self-exclusion, cool-off). Call
   **player-limits** (Team Responsible Gaming). Self-excluded or cool-off players must never be shown an offer
   (`may_receive_promotions: false`). Also check **geo-compliance** for product availability by state.
4. **Check consumers before changing a response shape** (e.g. sportsbook-app consumes bets).

## Credentials
- Keys are **Passport references** (`{{vault:...}}`), never raw secrets. If you need access to a new
  service, stop and ask the developer to request it in Passport. Never copy keys into code, tests or logs.
