// admin: sandbox maintenance (not part of the demo story). Requires API_KEY_ADMIN.
import { reset, storeMode } from '../store.mjs';

export default {
  routes: [
    { method: 'POST', path: '/v1/reset', handler: async () => { await reset(); return { reset: true, store: storeMode() }; } },
    { method: 'GET', path: '/v1/status', handler: ({ state }) => ({ store: storeMode(), boosts: Object.keys(state.boosts).length, claims: Object.keys(state.claims).length, bets: Object.keys(state.bets).length }) },
  ],
};
