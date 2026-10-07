# Ridgeline API Sandbox

Six small HTTP APIs for a fictional sportsbook and casino, built with Next.js for Vercel. Each API has its own owner, its own OpenAPI spec and its own bearer key. That makes it a realistic target for demos of API discovery (Postman API Catalog), contract testing, and credential governance for AI agents (Postman Passport).

> Ridgeline is a fictional company. All players, markets and keys are sandbox data.

```
ridgeline-apis/
├── app/                     Next.js App Router
│   ├── page.tsx             Docs landing page (generated from lib/catalog.mjs)
│   ├── [service]/[...path]/ Every API: /<service>/v1/...  (exact paths, so Passport grants match)
│   └── healthz/             Health + which state store is active
├── lib/
│   ├── catalog.mjs          Single source of truth: services, owners, endpoints, schemas, examples
│   └── api/                 Request → Response core, auth, services, seed data, state store
├── public/specs/            OpenAPI 3.0 per API (+ history/bets.v1), served at /specs/*
├── public/postman/          Collections + environments, served at /postman/*
├── passport/                Vault seeding, endpoint map, registration script, daemon allowlist
├── demo/                    Local-only demo assets (excluded from the Vercel build)
│   ├── bet-slip/            Repo for the coding-agent demo (TICKET.md + planted traps)
│   └── agent/               Astropods agent "ridgeline-boost-ops"
├── scripts/                 keys, smoke, build:postman, demo:env, grep, reset, vercel-env
└── vercel.json
```

## APIs

| API | Owner | Endpoints | Passport reference |
|---|---|---|---|
| markets | Team Trading | `GET /markets/v1/events`, `GET /markets/v1/markets` | `RIDGELINE_MARKETS_KEY` |
| wallet | Team Payments | `POST /wallet/v1/wallet/balance`, `POST /wallet/v1/wallet/rewards/credit` | `RIDGELINE_WALLET_KEY` |
| promotions | Team Promotions | `GET/POST /promotions/v1/boosts`, `POST …/boosts/claim`, `GET …/boosts/claims` | `RIDGELINE_PROMOTIONS_KEY` |
| **player-limits** | **Team Responsible Gaming** | `POST /player-limits/v1/eligibility/check`, `POST /player-limits/v1/limits` | `RIDGELINE_PLAYER_LIMITS_KEY` |
| bets (v2) | Team Bet Platform | `POST /bets/v1/bets`, `GET /bets/v1/bets` | `RIDGELINE_BETS_KEY` |
| geo-compliance | Team Compliance | `POST /geo-compliance/v1/location/check` | `RIDGELINE_GEO_COMPLIANCE_KEY` |
| admin | (sandbox ops) | `POST /admin/v1/reset`, `GET /admin/v1/status` | not for demos |

**Sandbox players:** P-1001 NJ active · P-1002 PA near its daily limit · **P-1003 MI self-excluded** · P-1004 NY (no casino) · **P-1005 NJ cool-off**.

**Auth:** `Authorization: Bearer <that API's key>`. The API rejects:
- a missing key,
- another API's key,
- an **unresolved Passport reference** (`401 unresolved_reference`).

Each call logs one JSON line with a key fingerprint, never the key itself.

## Run locally (one command)

```bash
npm run local               # installs deps, creates .env.local keys, writes demo env files, starts next dev on :4100, runs the smoke test
npm run local -- --prod     # same, but production build + next start (closest to Vercel)
npm run local -- --port 5000 | --no-smoke | --fresh-keys
```
Ctrl+C stops it. Passport doesn't intercept `localhost`, so the Passport half of the demo needs the Vercel deployment. Everything else works locally.

## Local development (manual)

```bash
npm install
npm run keys > .env.local      # a fresh set of defined keys: the real secrets
npm run dev                    # http://localhost:4100
npm run smoke                  # 15 checks against the running app
npm run build:postman          # regenerate specs + collections after editing lib/catalog.mjs
```

## Deploy to Vercel

1. **Push** this folder to a Git repo and import it in Vercel. Framework: Next.js, already set in `vercel.json`.
   Or deploy from the CLI: `npm i -g vercel && vercel link && vercel --prod`.
2. **Environment variables** (Project → Settings → Environment Variables), all marked *Sensitive*:
   `API_KEY_MARKETS`, `API_KEY_WALLET`, `API_KEY_PROMOTIONS`, `API_KEY_PLAYER_LIMITS`, `API_KEY_BETS`, `API_KEY_GEO_COMPLIANCE`, `API_KEY_ADMIN`.
   Or run `scripts/vercel-env.sh`, which pushes the values from `.env.local`.
3. **Shared state** (recommended): add **Upstash for Redis** (or Vercel KV) from the Vercel Marketplace and connect it to the project. It injects `KV_REST_API_URL` / `KV_REST_API_TOKEN`.
   Without it, state lives in function memory and can reset between calls. `/healthz` reports `"store":"redis"` when it's connected.
4. **Regenerate the downloads** with your real host, then commit and redeploy:
   ```bash
   SANDBOX_HOST=your-project.vercel.app npm run build:postman
   ```
5. **Verify:** `SANDBOX_BASE_URL=https://your-project.vercel.app npm run smoke`.

Use a **stable domain** (the production `*.vercel.app` alias or a custom domain), not preview URLs. Passport endpoints are registered against the hostname.

`vercel.json` sets `no-store` and `noindex` on every API route. The landing page also sets `robots: noindex`.

## Postman workspace (API Catalog)

**Headless:** push the specs, collections and environments with the Postman API. Re-runs update in place.
```bash
# .env.local: POSTMAN_API_KEY=PMAK-...   POSTMAN_WORKSPACE_ID=<id>
npm run postman:push -- --dry-run
npm run postman:push
# or create the workspace too:  npm run postman:push -- --create "Ridgeline API Sandbox" --type personal
```

**Manual:**

Import from `public/specs/` and `public/postman/` (or from `https://<host>/specs/...` and `/postman/...`):
1. Import the six specs and the collections (decline auto-generating collections from the specs).
   - For the bets spec, import `specs/history/bets.v1.openapi.json` first, then `bets.openapi.json` as a new version, so the history shows `stake` → `stake_minor`.
2. Link each collection to its spec. Set the owners.
3. Add a monitor on the player-limits collection.
4. Register the six APIs in the **API Catalog**.
5. Use **sportsbook-app-contract** as the consumer of bets.
6. Use the **Ridgeline Sandbox · Passport** environment: `base_url` is your host, and every key is `{{vault:RIDGELINE_*_KEY}}`.

## Passport

See [`passport/README.md`](passport/README.md):
- `passport/vault-seed.sh hashicorp|aws|gcp` stores the keys,
- register the endpoints with `node passport/register.mjs --apply` (or import the specs),
- request and approve access,
- `passport whoami` shows the references.

## Demo assets (local only)

```bash
SANDBOX_BASE_URL=https://your-project.vercel.app npm run demo:env   # writes bet-slip .env (raw keys) / .env.passport / transcript, and agent/.env
npm run grep                                                         # "where are the keys right now?"
npm run reset                                                        # back to the "before" state (+ resets sandbox state if API_KEY_ADMIN is set)
```
- `demo/bet-slip`: the coding-agent target. Run `git init && git add -A && git commit -m baseline` inside it once, so `npm run reset` can restore it.
- `demo/agent`: the Astropods agent. See [`demo/agent/README.md`](demo/agent/README.md).
- Stage script: [`docs/demo-runbook.md`](docs/demo-runbook.md).
