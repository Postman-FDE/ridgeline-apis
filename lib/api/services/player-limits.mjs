// player-limits: responsible-gaming eligibility. Owner: Team Responsible Gaming.
// Every offer, boost, claim or wager must be checked here first. Never reimplement this logic in a caller.
import { HttpError, required, intMinor } from '../http.mjs';
import { checkEligibility } from './rules.mjs';

export default {
  routes: [
    {
      method: 'POST', path: '/v1/eligibility/check',
      handler: ({ state, body }) => {
        required(body, ['player_id', 'product']);
        if (body.amount_minor !== undefined) intMinor(body.amount_minor, 'amount_minor');
        return checkEligibility(state, body);
      },
    },
    {
      method: 'POST', path: '/v1/limits',
      handler: ({ state, body }) => {
        required(body, ['player_id']);
        const p = state.players[body.player_id];
        if (!p) throw new HttpError(404, 'player_not_found', `Unknown player ${body.player_id}.`);
        return { player_id: body.player_id, status: p.status, daily_wager_limit_minor: p.daily_wager_limit_minor, wagered_today_minor: p.wagered_today_minor };
      },
    },
  ],
};
