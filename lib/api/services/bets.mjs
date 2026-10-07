// bets: bet placement. Owner: Team Bet Platform.
// API v2 (2026-07): `stake` (decimal dollars) was removed and replaced by `stake_minor` (integer cents).
import { HttpError, required, intMinor } from '../http.mjs';
import { nextId } from '../store.mjs';
import { checkEligibility, checkLocation, getWallet } from './rules.mjs';

const findOutcome = (state, market_id, outcome_id) => {
  const market = state.markets.find((m) => m.market_id === market_id);
  const outcome = market?.outcomes.find((o) => o.outcome_id === outcome_id);
  return market && outcome ? { market, outcome } : null;
};

export default {
  routes: [
    {
      method: 'POST', path: '/v1/bets', mutates: true,
      handler: ({ state, body }) => {
        if ('stake' in body) {
          throw new HttpError(400, 'unsupported_field', '`stake` was removed in bets API v2 (2026-07). Send `stake_minor` as an integer in cents, e.g. 1000 for $10.00.', { field: 'stake', replacement: 'stake_minor' });
        }
        required(body, ['player_id', 'selections', 'stake_minor']);
        intMinor(body.stake_minor, 'stake_minor');
        if (!Array.isArray(body.selections) || body.selections.length === 0) throw new HttpError(400, 'invalid_selections', '`selections` must be a non-empty array of { market_id, outcome_id }.');

        // Platform-side safety net: re-check location and responsible gaming at placement.
        const product = body.product ?? 'sportsbook';
        const geo = checkLocation(state, { player_id: body.player_id, product });
        if (!geo.allowed) throw new HttpError(403, 'product_not_available', `${product} is not available in ${geo.state}.`);
        const elig = checkEligibility(state, { player_id: body.player_id, product, amount_minor: body.stake_minor });
        if (!elig.eligible) throw new HttpError(403, 'player_not_eligible', 'Player is not eligible to place this wager.', { reasons: elig.reasons });

        let decimal = 1;
        for (const s of body.selections) {
          const found = findOutcome(state, s.market_id, s.outcome_id);
          if (!found) throw new HttpError(404, 'selection_not_found', `Unknown selection ${s.market_id}/${s.outcome_id}.`);
          decimal *= found.outcome.decimal_odds;
        }

        let boost = null;
        if (body.boost_id) {
          boost = state.boosts[body.boost_id];
          if (!boost) throw new HttpError(404, 'boost_not_found', `Unknown boost ${body.boost_id}.`);
          if (!state.claims[`${body.boost_id}:${body.player_id}`]) throw new HttpError(409, 'boost_not_claimed', 'Claim the boost via promotions before placing a boosted bet.');
        }

        const profit = body.stake_minor * (decimal - 1) * (boost ? 1 + boost.profit_boost_pct / 100 : 1);
        const rewards = boost ? Math.floor((body.stake_minor * boost.rewards_back_pct) / 100) : 0;
        state.players[body.player_id].wagered_today_minor += body.stake_minor;
        const wallet = getWallet(state, body.player_id);
        wallet.cash_minor -= body.stake_minor;
        wallet.rewards_minor += rewards;

        const bet = {
          bet_id: nextId(state, 'BET'),
          player_id: body.player_id,
          status: 'accepted',
          product,
          selections: body.selections,
          stake_minor: body.stake_minor,
          potential_payout_minor: Math.round(body.stake_minor + profit),
          boost_id: boost?.boost_id ?? null,
          rewards_earned_minor: rewards,
          placed_at: new Date().toISOString(),
        };
        state.bets[bet.bet_id] = bet;
        return { status: 201, body: bet };
      },
    },
    { method: 'GET', path: '/v1/bets', handler: ({ state, query }) => ({ bets: Object.values(state.bets).filter((b) => !query.player_id || b.player_id === query.player_id) }) },
  ],
};
