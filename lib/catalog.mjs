// Single source of truth for the Ridgeline API estate: services, owners, endpoints, schemas, examples.
// scripts/build-postman.mjs and the docs page turn this into OpenAPI specs, Postman collections, environments,
// and the Passport endpoint/secret map. Edit here, then run: npm run build:postman

const id = { type: 'string' };
const minor = (description) => ({ type: 'integer', minimum: 1, description });
const product = { type: 'string', enum: ['sportsbook', 'casino'] };
const error = {
  type: 'object',
  required: ['error', 'message'],
  properties: { error: { type: 'string' }, message: { type: 'string' } },
};

export const services = [
  {
    name: 'markets',
    title: 'Markets API',
    owner: 'Team Trading',
    secretRef: 'RIDGELINE_MARKETS_KEY',
    description: 'Events and odds for the sportsbook. Read-only.',
    endpoints: [
      { method: 'GET', path: '/v1/events', summary: 'List events', response: { type: 'object', properties: { events: { type: 'array', items: { type: 'object' } } } } },
      {
        method: 'GET', path: '/v1/markets', summary: 'List markets with odds for an event',
        query: [{ name: 'event_id', example: 'EVT-FINAL-2026', description: 'Filter by event.' }],
        response: { type: 'object', properties: { markets: { type: 'array', items: { type: 'object' } } } },
      },
    ],
  },
  {
    name: 'wallet',
    title: 'Wallet API',
    owner: 'Team Payments',
    secretRef: 'RIDGELINE_WALLET_KEY',
    description: 'Player balances (cash, bonus, rewards) and rewards credits. All amounts are integer minor units (cents).',
    endpoints: [
      {
        method: 'POST', path: '/v1/wallet/balance', summary: 'Get a player balance',
        request: { type: 'object', required: ['player_id'], properties: { player_id: id } },
        example: { player_id: 'P-1001' },
      },
      {
        method: 'POST', path: '/v1/wallet/rewards/credit', summary: 'Credit rewards to a player (idempotent)',
        request: { type: 'object', required: ['player_id', 'amount_minor', 'reason', 'idempotency_key'], properties: { player_id: id, amount_minor: minor('Rewards credit in cents.'), reason: { type: 'string' }, idempotency_key: { type: 'string' } } },
        example: { player_id: 'P-1001', amount_minor: 100, reason: 'Championship Rewards Boost', idempotency_key: 'demo-credit-001' },
      },
    ],
  },
  {
    name: 'promotions',
    title: 'Promotions API',
    owner: 'Team Promotions',
    secretRef: 'RIDGELINE_PROMOTIONS_KEY',
    description:
      'Boosts and claims. **Promotions does not check responsible-gaming eligibility.** Callers MUST call player-limits `POST /v1/eligibility/check` (and honor `may_receive_promotions`) and geo-compliance before offering or claiming a boost.',
    endpoints: [
      { method: 'GET', path: '/v1/boosts', summary: 'List boosts' },
      {
        method: 'POST', path: '/v1/boosts', summary: 'Create a boost',
        request: {
          type: 'object', required: ['name', 'market_id', 'profit_boost_pct', 'rewards_back_pct', 'products'],
          properties: { name: { type: 'string' }, market_id: id, profit_boost_pct: { type: 'integer' }, rewards_back_pct: { type: 'integer' }, products: { type: 'array', items: product } },
        },
        example: { name: 'Championship Rewards Boost', market_id: 'MKT-ML-001', profit_boost_pct: 25, rewards_back_pct: 10, products: ['sportsbook', 'casino'] },
        capture: { boost_id: 'boost_id' },
      },
      {
        method: 'POST', path: '/v1/boosts/claim', summary: 'Claim a boost for a player (caller must check eligibility first)',
        request: { type: 'object', required: ['boost_id', 'player_id'], properties: { boost_id: id, player_id: id } },
        example: { boost_id: '{{boost_id}}', player_id: 'P-1001' },
      },
      {
        method: 'GET', path: '/v1/boosts/claims', summary: 'List claims for a boost',
        query: [{ name: 'boost_id', example: '{{boost_id}}', description: 'Filter by boost.' }],
      },
    ],
  },
  {
    name: 'player-limits',
    title: 'Player Limits API',
    owner: 'Team Responsible Gaming',
    secretRef: 'RIDGELINE_PLAYER_LIMITS_KEY',
    description:
      'Responsible-gaming eligibility: self-exclusion, cool-off and daily wager limits. **The single source of truth for player protection. Never reimplement this logic in a caller.** Self-excluded and cool-off players must not receive promotional offers (`may_receive_promotions: false`).',
    endpoints: [
      {
        method: 'POST', path: '/v1/eligibility/check', summary: 'Check whether a player may wager / receive promotions',
        request: { type: 'object', required: ['player_id', 'product'], properties: { player_id: id, product, amount_minor: minor('Optional wager amount in cents.') } },
        example: { player_id: 'P-1003', product: 'sportsbook', amount_minor: 1000 },
        response: {
          type: 'object', required: ['player_id', 'eligible', 'reasons', 'may_receive_promotions'],
          properties: {
            player_id: id, product, eligible: { type: 'boolean' },
            reasons: { type: 'array', items: { type: 'string', enum: ['SELF_EXCLUDED', 'COOL_OFF', 'DAILY_WAGER_LIMIT'] } },
            may_receive_promotions: { type: 'boolean' }, remaining_daily_wager_minor: { type: 'integer' }, checked_at: { type: 'string', format: 'date-time' },
          },
        },
      },
      {
        method: 'POST', path: '/v1/limits', summary: 'Get a player\'s limits and status',
        request: { type: 'object', required: ['player_id'], properties: { player_id: id } },
        example: { player_id: 'P-1002' },
      },
    ],
  },
  {
    name: 'bets',
    title: 'Bets API',
    owner: 'Team Bet Platform',
    secretRef: 'RIDGELINE_BETS_KEY',
    version: '2.0.0',
    description:
      'Bet placement. **v2 (2026-07): `stake` (decimal dollars) was removed and replaced by `stake_minor` (integer cents).** Requests containing `stake` are rejected. Bets re-checks eligibility and location at placement as a safety net; it does not replace checking before an offer.',
    endpoints: [
      {
        method: 'POST', path: '/v1/bets', summary: 'Place a bet',
        request: {
          type: 'object', required: ['player_id', 'selections', 'stake_minor'], additionalProperties: false,
          properties: {
            player_id: id, product,
            selections: { type: 'array', minItems: 1, items: { type: 'object', required: ['market_id', 'outcome_id'], properties: { market_id: id, outcome_id: id } } },
            stake_minor: minor('Stake in cents. 1000 = $10.00.'),
            boost_id: id,
          },
        },
        example: { player_id: 'P-1001', selections: [{ market_id: 'MKT-ML-001', outcome_id: 'OUT-HAWKS' }], stake_minor: 1000 },
        response: {
          type: 'object', required: ['bet_id', 'status', 'stake_minor', 'potential_payout_minor', 'rewards_earned_minor'],
          properties: {
            bet_id: id, player_id: id, status: { type: 'string', enum: ['accepted'] }, product,
            stake_minor: { type: 'integer' }, potential_payout_minor: { type: 'integer' }, boost_id: { type: 'string', nullable: true },
            rewards_earned_minor: { type: 'integer' }, placed_at: { type: 'string', format: 'date-time' },
          },
        },
      },
      {
        method: 'GET', path: '/v1/bets', summary: 'List bets',
        query: [{ name: 'player_id', example: 'P-1001', description: 'Filter by player.' }],
      },
    ],
  },
  {
    name: 'geo-compliance',
    title: 'Geo Compliance API',
    owner: 'Team Compliance',
    secretRef: 'RIDGELINE_GEO_COMPLIANCE_KEY',
    description: 'Which products a player may access in their state. Casino is available in NJ, PA and MI only (sandbox data).',
    endpoints: [
      {
        method: 'POST', path: '/v1/location/check', summary: 'Check product availability for a player\'s location',
        request: { type: 'object', required: ['player_id', 'product'], properties: { player_id: id, product } },
        example: { player_id: 'P-1004', product: 'casino' },
      },
    ],
  },
];

export const errorSchema = error;
