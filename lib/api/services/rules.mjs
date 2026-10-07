// Shared rules used by several services (the platform-side safety nets).
import { HttpError } from '../http.mjs';

const PRODUCTS = ['sportsbook', 'casino'];

export function checkEligibility(state, { player_id, product, amount_minor }) {
  const p = state.players[player_id];
  if (!p) throw new HttpError(404, 'player_not_found', `Unknown player ${player_id}.`);
  if (!PRODUCTS.includes(product)) throw new HttpError(400, 'invalid_product', `product must be one of: ${PRODUCTS.join(', ')}.`);
  const reasons = [];
  if (p.status === 'self_excluded') reasons.push('SELF_EXCLUDED');
  if (p.status === 'cool_off') reasons.push('COOL_OFF');
  const remaining = Math.max(0, p.daily_wager_limit_minor - p.wagered_today_minor);
  if (amount_minor !== undefined && amount_minor > remaining) reasons.push('DAILY_WAGER_LIMIT');
  return {
    player_id,
    product,
    eligible: reasons.length === 0,
    reasons,
    // Self-excluded and cool-off players must not receive marketing or promotional offers of any kind.
    may_receive_promotions: !reasons.includes('SELF_EXCLUDED') && !reasons.includes('COOL_OFF'),
    remaining_daily_wager_minor: remaining,
    checked_at: new Date().toISOString(),
  };
}

export function checkLocation(state, { player_id, product }) {
  const p = state.players[player_id];
  if (!p) throw new HttpError(404, 'player_not_found', `Unknown player ${player_id}.`);
  const allowed = Boolean(state.jurisdictions[p.state]?.[product]);
  return { player_id, state: p.state, product, allowed, reason: allowed ? null : 'PRODUCT_NOT_AVAILABLE_IN_STATE' };
}

export function getWallet(state, player_id) {
  const w = state.wallets[player_id];
  if (!w) throw new HttpError(404, 'player_not_found', `Unknown player ${player_id}.`);
  return w;
}
