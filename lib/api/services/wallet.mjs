// wallet: balances and rewards credits. Owner: Team Payments.
import { required, intMinor } from '../http.mjs';
import { getWallet } from './rules.mjs';

export default {
  routes: [
    {
      method: 'POST', path: '/v1/wallet/balance',
      handler: ({ state, body }) => {
        required(body, ['player_id']);
        return { player_id: body.player_id, ...getWallet(state, body.player_id) };
      },
    },
    {
      method: 'POST', path: '/v1/wallet/rewards/credit', mutates: true,
      handler: ({ state, body }) => {
        required(body, ['player_id', 'amount_minor', 'reason', 'idempotency_key']);
        intMinor(body.amount_minor, 'amount_minor');
        const w = getWallet(state, body.player_id);
        if (!state.credited[body.idempotency_key]) {
          state.credited[body.idempotency_key] = true;
          w.rewards_minor += body.amount_minor;
        }
        return { status: 201, body: { player_id: body.player_id, rewards_minor: w.rewards_minor, idempotency_key: body.idempotency_key } };
      },
    },
  ],
};
