// Documentation for every Ridgeline API. scripts/build-postman.mjs merges this into the OpenAPI specs
// (info, tags, operations, error responses, field descriptions) and the Postman collection docs.
// Markdown is supported everywhere. Ridgeline is a fictional company; all data is sandbox data.

export const conventions = `
## Conventions

- **Base URL:** \`https://<host>/<api>\`, e.g. \`https://<host>/bets/v1/bets\`. Paths are exact (no path parameters), so access grants can match method + host + path.
- **Money:** every amount is an **integer in minor units (cents)**. \`1000\` = $10.00. Decimals are rejected.
- **Products:** \`sportsbook\` or \`casino\`.
- **Players:** sandbox players \`P-1001\` to \`P-1005\` (see each API's notes).
- **Errors:** JSON \`{ "error": "<code>", "message": "<human readable>" }\`, plus extra fields where noted.
- **Idempotency:** write endpoints that move value take an \`idempotency_key\` or are naturally idempotent (claims).
`;

export const auth = `
## Authentication

Send \`Authorization: Bearer <key>\`. **Each API has its own key**, and a key for one API is rejected by the others.

Keys are never handed out directly. Request access and you receive a **credential reference** such as \`{{vault:RIDGELINE_BETS_KEY}}\`. A secure access proxy (Postman Passport) swaps the reference for the real key at call time, so neither your code, your agent nor its logs ever hold the secret.

| Response | Meaning |
|---|---|
| \`401 unauthorized\` | Missing key, or a key for a different API |
| \`401 unresolved_reference\` | A \`{{vault:...}}\` reference reached the API unresolved: the call skipped the proxy |
`;

// How an agent (or any client) should react to each error code. Used in specs and collection docs.
export const errorHandling = {
  missing_fields: { recoverable: 'yes', action: 'Fix the input: add the fields listed in `fields`, then retry.' },
  invalid_json: { recoverable: 'yes', action: 'Fix the input: send a valid JSON body, then retry.' },
  invalid_amount: { recoverable: 'yes', action: 'Fix the input: send a positive integer in cents (e.g. 1000), then retry.' },
  invalid_product: { recoverable: 'yes', action: 'Fix the input: use `sportsbook` or `casino`.' },
  invalid_selections: { recoverable: 'yes', action: 'Fix the input: send at least one `{ market_id, outcome_id }`.' },
  unsupported_field: { recoverable: 'yes', action: 'Fix the input: rename the field to the one in `replacement` (e.g. `stake` to `stake_minor`, in cents).' },
  unauthorized: { recoverable: 'yes', action: 'Re-authenticate: send this API\'s own key (as a Passport reference). Do not try other APIs\' keys.' },
  unresolved_reference: { recoverable: 'yes', action: 'Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry.' },
  player_not_found: { recoverable: 'no', action: 'Stop: the player ID is wrong. Do not guess another ID.' },
  market_not_found: { recoverable: 'yes', action: 'Look up a valid `market_id` with markets `GET /v1/markets`, then retry.' },
  boost_not_found: { recoverable: 'yes', action: 'Look up the boost with promotions `GET /v1/boosts`, or create it first.' },
  selection_not_found: { recoverable: 'yes', action: 'Look up valid outcomes with markets `GET /v1/markets`, then retry.' },
  boost_not_claimed: { recoverable: 'yes', action: 'Check eligibility, claim the boost with promotions `POST /v1/boosts/claim`, then retry the bet.' },
  player_not_eligible: { recoverable: 'no', action: 'Stop: player protection blocked this. Do not retry, do not offer an alternative promotion, and report the `reasons`.' },
  product_not_available: { recoverable: 'no', action: 'Stop for this product: it is not available in the player\'s state. Another product may be.' },
  internal: { recoverable: 'maybe', action: 'Retry once with backoff. If it repeats, stop and report.' },
};

export const getAccess = (svc) => `
## Getting access (credential acquisition)

1. **Find the API** in the Postman API Catalog (or the Ridgeline Sandbox workspace): **${svc.title}**, owned by **${svc.owner}**.
2. **Request access** in Postman Passport: namespace **Ridgeline Sandbox**, resource group **${svc.title}**. Pick the shortest duration that covers the job and give a reason.
3. **Wait for approval** from ${svc.owner}. The grant is scoped to this API's endpoints (method + host + path) and expires on its own.
4. **Use the reference**, not a key: \`passport whoami\` shows it, e.g. \`{{vault:${svc.secretRef}}}\`. Send it as \`Authorization: Bearer {{vault:${svc.secretRef}}}\` through the Passport proxy.

There are no scopes beyond the endpoint grant. One grant per API: a key for one API never works on another.
`;



export const commonErrors = {
  400: { error: 'missing_fields', message: 'Missing required field(s): player_id.', fields: ['player_id'] },
  401: { error: 'unauthorized', message: 'Missing or invalid bearer key for this API.' },
  500: { error: 'internal', message: 'Unexpected error.' },
};

export const players = `
| Player | State | Status | Use it to test |
|---|---|---|---|
| \`P-1001\` | NJ | active | the happy path |
| \`P-1002\` | PA | active, $20.00 left of a $50.00 daily limit | \`DAILY_WAGER_LIMIT\` |
| \`P-1003\` | MI | **self-excluded** until 2027-06-30 | blocked wagers, **no promotions** |
| \`P-1004\` | NY | active | casino not available in state |
| \`P-1005\` | NJ | **cool-off** | blocked wagers, **no promotions** |
`;

// Field descriptions applied wherever these property names appear in a schema.
export const fields = {
  player_id: 'Sandbox player ID, `P-1001` to `P-1005`.',
  product: '`sportsbook` or `casino`.',
  amount_minor: 'Amount in minor units (cents). Integer, at least 1.',
  stake_minor: 'Stake in minor units (cents). Integer, at least 1. `1000` = $10.00. Replaces the v1 `stake` field.',
  stake: 'v1 only (removed in v2): stake in dollars as a decimal.',
  potential_payout_minor: 'Total return if the bet wins (stake + profit, including any boost), in cents.',
  rewards_earned_minor: 'Rewards credited by this bet (from the boost), in cents.',
  rewards_minor: 'Rewards balance in cents.',
  cash_minor: 'Withdrawable cash balance in cents.',
  bonus_minor: 'Bonus balance in cents.',
  boost_id: 'Boost to apply. The player must have claimed it first.',
  market_id: 'Market ID from the markets API, e.g. `MKT-ML-001`.',
  outcome_id: 'Outcome ID within the market, e.g. `OUT-HAWKS`.',
  selections: 'One or more `{ market_id, outcome_id }`. More than one makes a parlay (odds multiply).',
  eligible: '`true` if the player may place this wager now.',
  reasons: 'Why the player is blocked: `SELF_EXCLUDED`, `COOL_OFF`, `DAILY_WAGER_LIMIT`. Empty when eligible.',
  may_receive_promotions: '`false` for self-excluded and cool-off players. Callers must not show, offer or claim any promotion when this is `false`.',
  remaining_daily_wager_minor: 'How much more the player may wager today, in cents.',
  checked_at: 'When the check ran (ISO 8601).',
  profit_boost_pct: 'Extra profit on a winning boosted bet, as a whole-number percent (25 = +25% profit).',
  rewards_back_pct: 'Share of the stake credited as rewards, as a whole-number percent (10 = 10% of stake).',
  products: 'Products the boost applies to.',
  name: 'Display name.',
  reason: 'Why the credit was issued (shown in the ledger).',
  idempotency_key: 'Unique key per credit. Replaying the same key returns the same result and never double-credits.',
  bet_id: 'Bet ID, e.g. `BET-00012`.',
  status: 'Lifecycle status.',
  placed_at: 'When the bet was accepted (ISO 8601).',
  allowed: '`true` if the product is available in the player\'s state.',
  state: 'Two-letter US state of the player.',
};

export const services = {
  markets: {
    overview: `
Read-only catalog of **events** and **markets with odds**. Use it to build a bet slip and to find the \`market_id\` / \`outcome_id\` that bets and promotions need.

**Owner:** Team Trading · **Consumers:** bet-slip, sportsbook-app, promotions tooling

The sandbox has one event, \`EVT-FINAL-2026\` (Championship Final: Harbor Hawks vs. Summit Bears), with a moneyline (\`MKT-ML-001\`) and a total (\`MKT-TOT-001\`).`,
    endpoints: {
      'GET /v1/events': { description: 'List upcoming events.' },
      'GET /v1/markets': {
        description: 'List markets with their outcomes and odds. Filter with `event_id`. American and decimal odds are both returned. Use `decimal_odds` for payout math (`payout = stake × decimal_odds`). An unknown `event_id` returns an empty list, not an error.',
      },
    },
  },
  wallet: {
    overview: `
Player balances (**cash**, **bonus**, **rewards**) and **rewards credits**. All amounts are integer cents.

**Owner:** Team Payments · **Consumers:** bet-slip, promotions tooling, agents that issue rewards

Rewards credits are **idempotent**: send a unique \`idempotency_key\` per credit, and replaying a key never credits twice. Agents that move value should always generate a fresh key per intended credit.`,
    endpoints: {
      'POST /v1/wallet/balance': { description: 'Get a player\'s current balances.', errors: [[404, 'player_not_found', 'Unknown `player_id`.']] },
      'POST /v1/wallet/rewards/credit': {
        description: 'Credit rewards to a player. Idempotent on `idempotency_key`: the first call credits, replays return the current balance unchanged. **Check `player-limits` first.** Protected players (`may_receive_promotions: false`) must not receive promotional credits.',
        errors: [[400, 'invalid_amount', '`amount_minor` is not a positive integer.'], [404, 'player_not_found', 'Unknown `player_id`.']],
      },
    },
  },
  promotions: {
    overview: `
**Boosts** (profit boost + rewards back) and **claims**.

**Owner:** Team Promotions · **Consumers:** bet-slip, boost-ops agent, CRM tooling

> **Important:** promotions does **not** check responsible gaming or state availability. Before offering or claiming a boost, every caller must:
> 1. call **player-limits** \`POST /v1/eligibility/check\`, and skip the player if \`may_receive_promotions\` is \`false\`;
> 2. call **geo-compliance** \`POST /v1/location/check\` for each product the boost covers.

A boost only affects a bet after the player has **claimed** it. Claims are idempotent per (boost, player).`,
    endpoints: {
      'GET /v1/boosts': { description: 'List boosts.' },
      'POST /v1/boosts': {
        description: 'Create a boost on a market. `profit_boost_pct` raises the profit of a winning bet; `rewards_back_pct` credits a share of the stake as rewards when the boosted bet is placed.',
        errors: [[404, 'market_not_found', 'Unknown `market_id`.']],
      },
      'POST /v1/boosts/claim': {
        description: 'Claim a boost for a player. **The caller must check eligibility and location first.** This endpoint does not. Claiming twice returns the existing claim.',
        errors: [[404, 'boost_not_found', 'Unknown `boost_id`.']],
      },
      'GET /v1/boosts/claims': { description: 'List claims, optionally for one `boost_id`. Use it to verify the end state after a campaign: no protected player should hold a claim.' },
    },
  },
  'player-limits': {
    overview: `
**Responsible-gaming eligibility**: self-exclusion, cool-off and daily wager limits. This is the **single source of truth for player protection**. Never reimplement these rules in a caller.

**Owner:** Team Responsible Gaming · **Consumers:** bets (safety net), bet-slip, promotions tooling, boost-ops agent

Two different questions, one call:
- **May they wager this amount now?** → \`eligible\` (considers \`amount_minor\` against the daily limit).
- **May they receive any promotion?** → \`may_receive_promotions\`. This is \`false\` for self-excluded and cool-off players **regardless of amount**.

${players}`,
    endpoints: {
      'POST /v1/eligibility/check': {
        description: 'Check a player before any wager, offer, boost or claim. Pass `amount_minor` to include the daily-limit check. A player can be ineligible for a wager (`DAILY_WAGER_LIMIT`) yet still allowed promotions.',
        errors: [[400, 'invalid_product', '`product` is not `sportsbook` or `casino`.'], [404, 'player_not_found', 'Unknown `player_id`.']],
      },
      'POST /v1/limits': { description: 'Get a player\'s protection status and daily limit usage.', errors: [[404, 'player_not_found', 'Unknown `player_id`.']] },
    },
  },
  bets: {
    overview: `
**Bet placement**, single or parlay, optionally with a claimed boost.

**Owner:** Team Bet Platform · **Consumers:** bet-slip, sportsbook-app (contract tested)

### v2 (2026-07): breaking change
\`stake\` (decimal dollars) was **removed** and replaced by \`stake_minor\` (integer cents). Requests that still send \`stake\` are rejected with \`400 unsupported_field\` and a \`replacement\` hint. The v1 spec is kept in history for reference.

### Safety nets
At placement, bets re-checks **geo-compliance** and **player-limits** and rejects with \`403\`. This is a backstop, not a substitute: callers must still check eligibility **before** showing an offer.

### Payout math
\`potential_payout_minor = stake_minor + stake_minor × (decimal_odds − 1) × (1 + profit_boost_pct/100)\`, rounded. Parlays multiply decimal odds.`,
    endpoints: {
      'POST /v1/bets': {
        description: 'Place a bet. Send `stake_minor` in cents. To apply a boost, the player must have claimed it via promotions first.',
        errors: [
          [400, 'unsupported_field', 'The request contains the removed v1 `stake` field. The error includes `"replacement": "stake_minor"`.'],
          [400, 'invalid_amount', '`stake_minor` is not a positive integer.'],
          [403, 'player_not_eligible', 'Player-limits rejected the wager. `reasons` lists why (e.g. `SELF_EXCLUDED`).'],
          [403, 'product_not_available', 'The product is not available in the player\'s state.'],
          [404, 'selection_not_found', 'Unknown `market_id` / `outcome_id`.'],
          [409, 'boost_not_claimed', '`boost_id` given but the player has not claimed it.'],
        ],
      },
      'GET /v1/bets': { description: 'List bets, optionally for one `player_id`.' },
    },
  },
  'geo-compliance': {
    overview: `
Which **products** a player may access in their **state**. Check this before offering casino promotions or placing casino bets.

**Owner:** Team Compliance · **Consumers:** bets (safety net), promotions tooling, boost-ops agent

| State | Sportsbook | Casino |
|---|---|---|
| NJ | yes | yes |
| PA | yes | yes |
| MI | yes | yes |
| NY | yes | **no** |

*(Illustrative sandbox data only.)*`,
    endpoints: {
      'POST /v1/location/check': {
        description: 'Check whether `product` is available where the player is located. `reason` is `PRODUCT_NOT_AVAILABLE_IN_STATE` when it is not.',
        errors: [[404, 'player_not_found', 'Unknown `player_id`.']],
      },
    },
  },
};
