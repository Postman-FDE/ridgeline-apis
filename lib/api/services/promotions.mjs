// promotions: boosts and claims. Owner: Team Promotions.
// NOTE: promotions does NOT check responsible-gaming eligibility. Callers must call player-limits
// (POST /v1/eligibility/check) and geo-compliance before offering or claiming a boost.
import { HttpError, required } from '../http.mjs';
import { nextId } from '../store.mjs';

export default {
  routes: [
    { method: 'GET', path: '/v1/boosts', handler: ({ state }) => ({ boosts: Object.values(state.boosts) }) },
    {
      method: 'POST', path: '/v1/boosts', mutates: true,
      handler: ({ state, body }) => {
        required(body, ['name', 'market_id', 'profit_boost_pct', 'rewards_back_pct', 'products']);
        if (!state.markets.some((m) => m.market_id === body.market_id)) throw new HttpError(404, 'market_not_found', `Unknown market ${body.market_id}.`);
        const boost = {
          boost_id: nextId(state, 'BST'),
          name: body.name,
          market_id: body.market_id,
          profit_boost_pct: body.profit_boost_pct,
          rewards_back_pct: body.rewards_back_pct,
          products: body.products,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        state.boosts[boost.boost_id] = boost;
        return { status: 201, body: boost };
      },
    },
    {
      method: 'POST', path: '/v1/boosts/claim', mutates: true,
      handler: ({ state, body }) => {
        required(body, ['boost_id', 'player_id']);
        if (!state.boosts[body.boost_id]) throw new HttpError(404, 'boost_not_found', `Unknown boost ${body.boost_id}.`);
        const key = `${body.boost_id}:${body.player_id}`;
        state.claims[key] ??= { claim_id: nextId(state, 'CLM'), boost_id: body.boost_id, player_id: body.player_id, claimed_at: new Date().toISOString() };
        return { status: 201, body: state.claims[key] };
      },
    },
    {
      method: 'GET', path: '/v1/boosts/claims',
      handler: ({ state, query }) => ({ claims: Object.values(state.claims).filter((c) => !query.boost_id || c.boost_id === query.boost_id) }),
    },
  ],
};
