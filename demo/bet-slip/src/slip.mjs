import { listMarkets } from './clients/markets.mjs';

// Quote a single-selection slip. Amounts in cents.
export async function quote({ event_id, market_id, outcome_id, stake_minor }) {
  const markets = await listMarkets(event_id);
  const market = markets.find((m) => m.market_id === market_id);
  const outcome = market?.outcomes.find((o) => o.outcome_id === outcome_id);
  if (!outcome) throw Object.assign(new Error('Unknown selection'), { status: 404 });
  return {
    event_id,
    market_id,
    outcome_id,
    stake_minor,
    decimal_odds: outcome.decimal_odds,
    potential_payout_minor: Math.round(stake_minor * outcome.decimal_odds),
  };
}
