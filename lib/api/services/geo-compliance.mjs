// geo-compliance: which products a player may access in their state. Owner: Team Compliance.
import { required } from '../http.mjs';
import { checkLocation } from './rules.mjs';

export default {
  routes: [
    {
      method: 'POST', path: '/v1/location/check',
      handler: ({ state, body }) => {
        required(body, ['player_id', 'product']);
        return checkLocation(state, body);
      },
    },
  ],
};
