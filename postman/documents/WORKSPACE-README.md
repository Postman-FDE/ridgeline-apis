# Ridgeline API Sandbox

Six small APIs for a fictional sportsbook and casino, each with its **own owner, its own OpenAPI spec and its own bearer key**. Use this workspace to see how Postman handles the parts of API work that coding agents get wrong: knowing which API already exists, calling it the way its current contract says, proving the result with tests, and reaching it without ever holding a real key.

> **Ridgeline is a fictional company.** Every player, market, amount and key here is sandbox data.

| | |
|---|---|
| **APIs** | 6, plus a sandbox admin API |
| **Specs** | 7 OpenAPI 3.0 specs (including the deprecated bets v1, kept for history) |
| **Collections** | 9: one per API, an end-to-end flow, a consumer contract, and a full test suite |
| **Tests** | 81 requests, 292 assertions |
| **Source of truth** | A git repo. Everything here is generated, linted and pushed with the Postman CLI |

---

## Start here

1. Pick an environment (top right):
   - **Ridgeline Sandbox · Passport**: keys are Passport references such as `{{vault:RIDGELINE_BETS_KEY}}`. Use this with the Passport proxy running.
   - **Ridgeline Sandbox · Local (no keys)**: `http://localhost:4100`. Keys are blank on purpose, so requests return `401` until you add a key to the *current* value.
2. Open **Ridgeline · Test Suite** and run it with the **Collection Runner**. Every folder is order-independent.
3. Open any API collection to read its docs. Each request has a description, an error table, tests, and a saved example response.

---

## The APIs

| API | Owner | What it does | Key reference |
|---|---|---|---|
| **Markets** | Team Trading | Events and odds. Read-only | `RIDGELINE_MARKETS_KEY` |
| **Wallet** | Team Payments | Cash, bonus and rewards balances. Idempotent rewards credits | `RIDGELINE_WALLET_KEY` |
| **Promotions** | Team Promotions | Boosts and claims. **Does not check responsible gaming: callers must** | `RIDGELINE_PROMOTIONS_KEY` |
| **Player Limits** | Team Responsible Gaming | Self-exclusion, cool-off and daily limits. The single source of truth for player protection | `RIDGELINE_PLAYER_LIMITS_KEY` |
| **Bets (v2)** | Team Bet Platform | Bet placement. `stake` was removed in v2: send `stake_minor` in cents | `RIDGELINE_BETS_KEY` |
| **Geo Compliance** | Team Compliance | Which products are available in the player's state | `RIDGELINE_GEO_COMPLIANCE_KEY` |

### Sandbox players

| Player | State | Status | Good for testing |
|---|---|---|---|
| `P-1001` | NJ | active | The happy path |
| `P-1002` | PA | active, $20.00 left of a $50.00 daily limit | `DAILY_WAGER_LIMIT` |
| `P-1003` | MI | **self-excluded** | Blocked wagers and **no promotions** |
| `P-1004` | NY | active | Casino not available in state |
| `P-1005` | NJ | **cool-off** | Blocked wagers and **no promotions** |

### Conventions

- **Base URL:** `{{base_url}}/<api>/v1/...`, for example `{{base_url}}/bets/v1/bets`. Paths are exact (no path parameters), so access grants can match method, host and path.
- **Money:** integer minor units (cents). `1000` is $10.00. Decimals are rejected.
- **Errors:** `{ "error": "<code>", "message": "..." }`. Every request documents its error codes.

---

## Authentication: each API has its own key

Requests send `Authorization: Bearer {{<api>_key}}`. A key for one API is rejected by every other API.

Nobody is handed a raw key. You request access in **Postman Passport** and get a **credential reference** instead. The Passport Secure Access Proxy swaps the reference for the real key at call time, so the key never reaches your machine, your agent, its transcript, or Postman.

| Response | Meaning |
|---|---|
| `401 unauthorized` | No key, or a key for a different API |
| `401 unresolved_reference` | A `{{vault:...}}` reference reached the API unresolved, so the call skipped the proxy |

---

## Collections

| Collection | Requests | Assertions | Use it to |
|---|---|---|---|
| **Ridgeline · Test Suite** | 56 | 230 | Check auth on every API, functional behavior, business rules and negative cases |
| **Ridgeline · Championship Rewards Boost (E2E)** | 9 | 13 | Walk the full flow, ending with an end-state check that no self-excluded or cool-off player holds a claim |
| **Ridgeline · sportsbook-app consumer contract** | 3 | 6 | See the response shape a consumer depends on, and that the removed `stake` field fails loudly |
| **Ridgeline · Markets, Wallet, Promotions, Player Limits, Bets, Geo Compliance** | 13 | 43 | Explore one API. Every request checks status, response time, content type and its documented schema |

### Business rules the tests enforce

- `P-1003` is self-excluded, so `may_receive_promotions` must be `false`.
- A player over their daily limit can't wager, but can still receive promotions.
- Casino isn't available in NY.
- Replaying a rewards credit with the same `idempotency_key` never credits twice.
- A boosted bet pays `1000 + 770 × 1.25 = 1963`.
- Sending the removed v1 `stake` field returns `400 unsupported_field`, naming `stake_minor` as the replacement.

---

## How this workspace was built

Everything here comes from files in a git repo, generated from one catalog and published with the **Postman CLI** from Claude Code. Nothing was hand-edited in the app.

```bash
postman init                    # .postman/resources.yaml + Postman skills for coding agents
postman workspace connect-git   # bind the repo to this workspace
postman workspace lint          # governance rules and schema checks, locally
postman workspace diff          # preview what a push changes here
postman workspace push --yes    # publish specs, collections, environments and this page
postman collection run ...      # run the tests anywhere, including CI
```

Changes to this workspace arrive as a pull request first, so the specs, tests and docs are reviewed like code before they land here.
