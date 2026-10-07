# Ridgeline API Sandbox

Six small HTTP APIs for a fictional sportsbook and casino, built with Next.js and deployable to Vercel. Each API has its own owner, its own OpenAPI spec and its own bearer key. I built it as a realistic target for demos of API discovery (Postman API Catalog), contract testing, and credential governance for AI agents (Postman Passport).

> Ridgeline is a fictional company. All players, markets and keys are sandbox data.

I built almost all of this from a terminal, with Claude Code doing the typing and the Postman CLI doing almost everything Postman. I never opened the Postman app to create a collection, write a test, or upload a spec. The workspace itself was created through the Postman MCP server, and `postman login` needed one trip to a browser. Full disclosure: I'm Field CTO at Postman, so weigh the "why this matters" section accordingly. I've tried to put the rough edges next to it.

No setup at all: the public mock answers every endpoint with its documented example.

```bash
curl -s https://ridgeline-sandbox.mock.postman.postman.dev/markets/v1/events
```

Running it yourself:

```bash
npm run local            # keys, demo files, dev server on :4100, smoke test
npm run test:postman     # all 9 collections through the Postman CLI
postman workspace diff   # what a push would change in the workspace
```

## Headless Postman, driven from Claude Code

"Headless" here means the Postman CLI (1.70) running against plain files in this repo. The workspace is just where those files get published. The specs, collections and environments live in git like any other code, and the CLI lints them, diffs them against the cloud workspace, pushes them, and runs the tests.

This is the sequence Claude Code ran to set it up:

```bash
npm install -g postman-cli@latest        # 1.29 -> 1.70; the git-native workspace commands are new
postman init --yes                       # writes .postman/resources.yaml, adds Postman skills + AGENTS.md guidance
gh repo create ... --private --push      # connect-git needs an `origin` remote
postman workspace connect-git <workspace-id>
postman workspace lint                   # governance rules + schema checks, locally
postman workspace diff                   # what would change in the cloud, read-only
postman workspace push --yes             # creates and updates; never deletes a whole spec, collection or environment
postman collection run <collection.json> -e <env.json>
```

`.postman/resources.yaml` is the whole binding. It lists the 7 specs, 9 collections and 2 environments by path and names the workspace they belong to. Those files are generated from one source (`lib/catalog.mjs` plus `lib/docs.mjs`) by `npm run build:postman`, with example responses captured by running the real handlers in-process. Schemas and saved examples are rebuilt from the running code every time, so they can't silently drift from it. The prose in `lib/docs.mjs` can still go stale, and that's what the tests are for: they fail when behavior and the documented contract disagree.

### What actually happened along the way

It didn't go perfectly, and the rough edges are a good picture of what this looks like in practice.

- `postman init` ran as a guest and bound a throwaway workspace, because the stored CLI session had expired. `connect-git` failed with a 401 and said so. One `postman login` in a browser fixed it, and `connect-git` rebound the repo to the real workspace.
- `connect-git` needs a git remote. The folder wasn't a repo yet. That's reasonable, since the binding is "this repo backs that workspace", but it meant creating a private GitHub repo before Postman would accept the link.
- Lint found 17 warnings in my generated files. 15 were the governance rule that every operation should document a `5xx` response. The other 2 were a non-standard field I'd put in the environments. Fixed at the generator, re-ran, 0 warnings.
- `diff` caught a bug I'd never have spotted in the app. The cloud rewrites `/` and `:` in request names, so `POST /v1/bets` came back as `POST -v1-bets`. Every push would have removed and re-added those requests. The diff showed it as a wall of `+`/`-` lines on the second push, so the generator now avoids those characters.
- Push writes cloud IDs back into the local files. I changed the generator to keep them across rebuilds, so a push updates in place instead of churning IDs.
- An update replaces what's inside a collection. "Never deletes" means whole entities. When the request names changed, the second push removed the old requests from inside each collection and added the new ones, which is correct, but it surprised me.
- One loose end: after a clean push, `diff` still reports a few collections and the Passport environment as "modified" with no field-level detail. Re-pushing doesn't change anything. I haven't tracked down which field the cloud normalizes, so treat a "modified" on those as noise for now.

### The tests

Claude Code wrote the tests into the generator, so they're regenerated with the collections rather than hand-edited in the app. Each request's docs list its checks, and the business-rule tests say why they exist.

| Collection | Requests | Assertions | What it checks |
|---|---|---|---|
| Ridgeline · Test Suite | 56 | 230 | Auth on every API (no key, wrong API's key, unresolved Passport reference, own key), functional behavior, business rules, negative cases |
| Championship Rewards Boost (E2E) | 9 | 13 | The full flow, ending with an end-state check that no self-excluded or cool-off player holds a claim |
| sportsbook-app consumer contract | 3 | 6 | The response shape a consumer relies on, and that the removed `stake` field fails loudly |
| One collection per API (6) | 13 | 43 | Status, response time, content type, and the documented response schema |

That's 81 requests and 292 assertions, all passing against a local server. A few of the business-rule checks I care about most:

- P-1003 is self-excluded, so `may_receive_promotions` must be `false`.
- A player over their daily limit is blocked from wagering but can still get promotions.
- Casino isn't available in NY.
- Replaying a rewards credit with the same idempotency key doesn't credit twice.
- A boosted bet pays `1000 + 770 × 1.25 = 1963`.

Run them all:

```bash
npm run local -- --no-smoke          # or npm run dev
npm run test:postman                 # every collection, via `postman collection run`
npm run test:postman -- test-suite   # just one
SANDBOX_BASE_URL=https://<host> npm run test:postman
```

`test:postman` builds a temporary environment from your `.env.local` keys, runs each collection with the Postman CLI, and deletes the file afterwards. The raw keys never land in a collection or a committed environment.

### Why this matters if your team uses Claude Code

Any agent can call an API. What changes with the CLI is that the agent's Postman work comes out as files and commands a teammate can review and rerun, the same artifacts a person on the team would have produced.

- **Changes arrive as a diff in a PR.** When Claude Code adds a test or fixes a spec, you review it in the pull request like any other change. `postman workspace diff` shows exactly what will change in the cloud before anything is pushed.
- **Governance runs before anything is published.** `postman workspace lint` applies the workspace's governance rules locally. The `5xx` warnings above were caught and fixed before they reached the workspace or the API Catalog.
- **Tests travel with the code.** The collections are in the repo, so `npm run test:postman` runs the identical suite on any machine, and the agent can run it to check its own work before it says it's done. CI would use the same command after `postman login --with-api-key`. There's no CI workflow in this repo yet.
- **The agent works in the same loop as everyone else.** Every step above is a command a developer can run by hand. Nothing depends on the agent, on a GUI session, or on someone remembering to click "sync".
- **`postman init` gives the agent context.** It installs Postman skills under `postman/skills/` and adds guidance to `AGENTS.md`, so the next coding agent in this repo is pointed at instructions for discovering, mocking and testing APIs here. Whether it follows them is up to the agent. I haven't measured that.

What it costs: the git-native workspace commands are new (they were marked beta in the 1.29 CLI I started with), the auth state confused me once (`whoami` said signed in while `init` ran as a guest), and there's the unexplained drift above. And the one thing I'd flag: `push` treats local files as the source of truth and overwrites cloud copies. The default strategy only creates and updates, and `--push-strategy force-sync` also deletes, so keep that flag out of anything an agent runs unattended.

## More Postman, also from the CLI

| Feature | Command | What's here |
|---|---|---|
| **Mock server** | `npm run mock:build`, then `postman mock push` / `deploy` | One public mock for all six APIs at [ridgeline-sandbox.mock.postman.postman.dev](https://ridgeline-sandbox.mock.postman.postman.dev), generated from the collections' saved examples. Use the **Ridgeline Sandbox · Mock** environment |
| **AI readiness** | `npm run ai-readiness` | Scores every spec and collection, writes [`docs/ai-readiness.md`](docs/ai-readiness.md), and fails below 75. Specs: Markets 95, the rest 80. Collections: 75 to 85 |
| **SDKs** | `npm run sdk` (add `python go ...` for more languages) | Typed TypeScript SDKs for all six APIs in `sdks/`. Tested against the local API: a bet places, and a self-excluded player comes back as a typed `403` |
| **Workspace overview** | `postman workspace push` | [`postman/documents/WORKSPACE-README.md`](postman/documents/WORKSPACE-README.md) is the workspace's overview page, versioned in git like everything else |
| **Collection docs** | `npm run build:postman` | Every collection, folder and request is documented, from run guides and SDK snippets to why each business-rule test exists. See [Documentation](#documentation) |

Two findings worth knowing:

- **The AI-readiness score is mostly a complexity score.** I added a real rate limit because the check said rate limiting was undetectable, and every spec dropped from 80 to 70. Rate limits are something an agent has to handle, so they count against it. The sandbox didn't need one, so it came out. What did help without costing points was a handling hint on every error code (recoverable or not, and what to do) and documented credential acquisition.
- **The Context Graph doesn't see this workspace yet.** `postman context-graph ask` answers from the team's catalog and team-visible workspaces, and this one is personal. It needs to be team-visible, with the APIs registered in the API Catalog, before questions like "what consumes bets?" have anything to answer from.

## Documentation

All of it is generated from one file, `lib/docs.mjs`, so the specs, the collections and the SDK READMEs say the same thing.

**In the OpenAPI specs** (`public/specs/`, served at `/specs/*`):

- An overview per API: what it's for, the owner, its consumers, and its rules. For example, promotions doesn't check eligibility, so callers must.
- Authentication with Passport references, how to get access (catalog, Passport request, owner approval), and shared conventions (integer cents, exact paths, error shape).
- A description for every operation, with an error table that says, for each code, whether it's recoverable and what a client or agent should do. `player_not_eligible` means stop, not retry.
- Descriptions on request and response fields, and an example for every documented error.

**In the Postman collections** (`public/postman/`, served at `/postman/*`, and on each collection's Docs tab in the workspace):

| Collection | What its docs add |
|---|---|
| The six API collections | The spec overview, plus a **Try it** section (a `curl` to the mock, a typed SDK snippet using that API's real method names), the environments table, and how to run it |
| Ridgeline · Test Suite | A folder-by-folder table of what each part proves. Every folder names its API and owner. All 56 requests list their checks, and the 11 that guard business rules also say why the test exists |
| Championship Rewards Boost (E2E) | The flow as a step table, and why the end-state check matters: every call can return 200 while the campaign is still wrong. Each step explains its purpose before the endpoint docs |
| sportsbook-app consumer contract | What a consumer-driven contract is, who owns it, what each request protects, and the CI command |

**In the workspace overview** ([`postman/documents/WORKSPACE-README.md`](postman/documents/WORKSPACE-README.md)): a start-here guide, the APIs, test players, auth rules, the mock server, AI readiness, SDKs, and how the workspace was built.

## APIs

| API | Owner | Endpoints | Passport reference |
|---|---|---|---|
| markets | Team Trading | `GET /markets/v1/events`, `GET /markets/v1/markets` | `RIDGELINE_MARKETS_KEY` |
| wallet | Team Payments | `POST /wallet/v1/wallet/balance`, `POST /wallet/v1/wallet/rewards/credit` | `RIDGELINE_WALLET_KEY` |
| promotions | Team Promotions | `GET/POST /promotions/v1/boosts`, `POST …/boosts/claim`, `GET …/boosts/claims` | `RIDGELINE_PROMOTIONS_KEY` |
| player-limits | Team Responsible Gaming | `POST /player-limits/v1/eligibility/check`, `POST /player-limits/v1/limits` | `RIDGELINE_PLAYER_LIMITS_KEY` |
| bets (v2) | Team Bet Platform | `POST /bets/v1/bets`, `GET /bets/v1/bets` | `RIDGELINE_BETS_KEY` |
| geo-compliance | Team Compliance | `POST /geo-compliance/v1/location/check` | `RIDGELINE_GEO_COMPLIANCE_KEY` |
| admin | (sandbox ops) | `POST /admin/v1/reset`, `GET /admin/v1/status` | not for demos |

**Sandbox players:** P-1001 NJ active · P-1002 PA near its daily limit · **P-1003 MI self-excluded** · P-1004 NY (no casino) · **P-1005 NJ cool-off**.

**Auth:** `Authorization: Bearer <that API's key>`. Each API rejects a missing key, another API's key, and an unresolved Passport reference (`401 unresolved_reference`). Every call logs one JSON line with a key fingerprint, never the key.

```
ridgeline-apis/
├── .postman/resources.yaml  Binds the specs, collections and environments to the Postman workspace
├── app/                     Next.js App Router: docs page, /<service>/v1/... routes, /healthz
├── lib/
│   ├── catalog.mjs          Services, owners, endpoints, schemas, examples
│   ├── docs.mjs             Documentation merged into specs and collections
│   └── api/                 Request → Response core, auth, services, seed data, state store
├── public/specs/            OpenAPI 3.0 per API (+ history/bets.v1)
├── public/postman/          Collections (incl. the test suite) + environments
├── postman/skills/          Postman skills installed by `postman init`
├── passport/                Vault seeding, endpoint map, registration script, daemon allowlist
├── demo/                    Local-only demo assets (excluded from the Vercel build)
└── scripts/                 local, keys, smoke, build:postman, test:postman, demo:env, grep, reset, vercel-env
```

## Run locally

```bash
npm run local               # deps, .env.local keys, demo env files, next dev on :4100, smoke test
npm run local -- --prod     # production build + next start (closest to Vercel)
npm run local -- --port 5000 | --no-smoke | --fresh-keys
```

Passport doesn't intercept `localhost`, so the Passport half of the demo needs the Vercel deployment. Everything else works locally.

## Keep the workspace in sync

```bash
SANDBOX_HOST=<host> npm run build:postman   # after editing lib/catalog.mjs or lib/docs.mjs
postman workspace lint
postman workspace diff
postman workspace push --yes
```

If you'd rather not use the CLI, `npm run postman:push` does the same through the Postman API with a `POSTMAN_API_KEY`.

## Deploy to Vercel

1. Import the GitHub repo in Vercel (the framework is set in `vercel.json`), or run `vercel link && vercel --prod`.
2. Set the `API_KEY_*` environment variables as *Sensitive*. `scripts/vercel-env.sh` pushes them from `.env.local`.
3. Add Upstash for Redis (or Vercel KV) from the Marketplace, so state survives between serverless calls. `/healthz` reports `"store":"redis"` when it's connected.
4. `SANDBOX_HOST=<your-domain> npm run build:postman`, push, redeploy, then `SANDBOX_BASE_URL=https://<your-domain> npm run smoke`.

Use the stable production domain, not preview URLs, because Passport endpoints are registered against the hostname. `vercel.json` sets `no-store` and `noindex` on every API route.

## Passport and the demo

- Passport setup: [`passport/README.md`](passport/README.md) (vault seeding, endpoint registration, `passport whoami`).
- Demo assets: `npm run demo:env`, `npm run grep`, `npm run reset`. Run `git init` in `demo/bet-slip` once so the reset can restore it.
- The Astropods agent: [`demo/agent/README.md`](demo/agent/README.md).
- Stage script: [`docs/demo-runbook.md`](docs/demo-runbook.md).
