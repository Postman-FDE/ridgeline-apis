# ridgeline-boost-ops (Astropods agent)

A promotions-operations agent: "Launch the Championship Rewards Boost and offer it to everyone eligible." It runs on Mastra and is served by `@astropods/adapter-mastra`.

**Tools** (`agent/tools/sandbox.ts`):
- `listMarkets`, `createBoost`, `checkPlayerEligibility`, `checkLocation`, `claimBoost`, `listClaims`, `getBalance`
- `claimBoost` **re-checks player-limits and geo-compliance itself**, so the model can't talk its way past responsible gaming. That's deterministic control where you need certainty.

**Credentials:**
- The custom `ridgeline` provider in `astropods.yml` injects `RIDGELINE_BASE_URL` and `RIDGELINE_{MARKETS,WALLET,PROMOTIONS,PLAYER_LIMITS,BETS,GEO}_KEY`. **Every key is a Passport reference**, never a raw key.
- If a grant is revoked, the tool returns an error and the agent reports which service it lost access to instead of retrying.

## Run it

**On the laptop (most reliable on stage):**
```bash
bun install
(cd ../.. && npm run demo:env)   # writes .env: set RIDGELINE_BASE_URL to your Vercel URL and paste the references from `passport whoami`
set -a; source .env; set +a; unset PASSPORT_PROXY_URL   # on the host, the daemon is reached via HTTPS_PROXY from `passport setup`
bun agent/local.ts
```
`local.ts` runs the same agent without the Astropods messaging sidecar and prints each tool call.

**Astropods local dev (Docker):**
```bash
ast login
ast project configure           # prompts for RIDGELINE_* (secret) and ANTHROPIC_API_KEY. Paste references.
ast project start               # chat UI at http://localhost:3100
```
Inside the container, calls go through `PASSPORT_PROXY_URL` (default `http://host.docker.internal:8081`, the host's Passport daemon).

**Rehearse this path first.** The daemon listens on `127.0.0.1` and terminates TLS with its own CA (`~/.postman/access-proxy/ca.pem`), so the container must be able to reach it and must trust that CA (e.g. `NODE_EXTRA_CA_CERTS`). If either fails, use the laptop path on stage.

**Deploy:**
```bash
ast secrets create RIDGELINE_PLAYER_LIMITS_KEY --value '{{vault:RIDGELINE_PLAYER_LIMITS_KEY}}'   # repeat per key
ast blueprint push
ast deploy ridgeline-boost-ops --var RIDGELINE_BASE_URL=https://<host> --var RIDGELINE_PLAYER_LIMITS_KEY=@RIDGELINE_PLAYER_LIMITS_KEY ...
```
A hosted agent needs a Passport proxy reachable from Astropods' cluster. Without one, the APIs return `401 unresolved_reference`. That's by design: a reference is useless without the proxy. Confirm the hosted Passport + Astropods path with both product teams before showing a deployed run.

## Model
`models.anthropic` injects `ANTHROPIC_API_KEY` (which can itself be a Passport reference for `POST api.anthropic.com/v1/messages`). Override the model with `RIDGELINE_AGENT_MODEL` (Mastra `provider/model` id). To use the Astropods AI Gateway instead, switch `models` to `provider: gateway`.

## Expected result
| Player | Sportsbook | Casino |
|---|---|---|
| P-1001 (NJ) | claimed | claimed |
| P-1002 (PA, near limit) | claimed | claimed |
| P-1003 (MI) | **skipped: SELF_EXCLUDED** | **skipped: SELF_EXCLUDED** |
| P-1004 (NY) | claimed | **skipped: not available in NY** |
| P-1005 (NJ) | **skipped: COOL_OFF** | **skipped: COOL_OFF** |

The end-state check (`listClaims`) should show only P-1001, P-1002 and P-1004.
