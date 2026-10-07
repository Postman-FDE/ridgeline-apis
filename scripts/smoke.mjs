// End-to-end smoke test with the raw keys from .env.local (API owner check, never through Passport).
// Usage: npm run dev (or start), then: npm run smoke.  Against a deployment: SANDBOX_BASE_URL=https://<host> npm run smoke
import { KEY_ENV } from '../lib/api/keys.mjs';
const keys = Object.fromEntries(Object.entries(KEY_ENV).map(([s, e]) => [s, process.env[e]]));

const base = process.env.SANDBOX_BASE_URL ?? 'http://localhost:4100';
const call = async (svc, method, path, body) => {
  const res = await fetch(`${base}/${svc}${path}`, {
    method,
    headers: { authorization: `Bearer ${keys[svc]}`, 'content-type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};
const check = (label, cond, detail) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${cond ? '' : `\n      ${JSON.stringify(detail)}`}`);
  if (!cond) process.exitCode = 1;
};

const unauth = await fetch(`${base}/bets/v1/bets`, { method: 'GET' });
check('rejects missing bearer key', unauth.status === 401);

const wrong = await fetch(`${base}/bets/v1/bets`, { headers: { authorization: `Bearer ${keys.markets}` } });
check('rejects another service\'s key', wrong.status === 401);

const ref = await fetch(`${base}/bets/v1/bets`, { headers: { authorization: 'Bearer {{vault:RIDGELINE_BETS_KEY}}' } });
check('flags an unresolved Passport reference', ref.status === 401 && (await ref.json()).error === 'unresolved_reference');

const mk = await call('markets', 'GET', '/v1/markets?event_id=EVT-FINAL-2026');
check('markets lists championship markets', mk.status === 200 && mk.body.markets.length === 2, mk);

const boost = await call('promotions', 'POST', '/v1/boosts', { name: 'Championship Rewards Boost', market_id: 'MKT-ML-001', profit_boost_pct: 25, rewards_back_pct: 10, products: ['sportsbook', 'casino'] });
check('promotions creates a boost', boost.status === 201, boost);

const se = await call('player-limits', 'POST', '/v1/eligibility/check', { player_id: 'P-1003', product: 'sportsbook', amount_minor: 1000 });
check('player-limits blocks self-excluded P-1003', se.body.eligible === false && se.body.reasons.includes('SELF_EXCLUDED') && se.body.may_receive_promotions === false, se);

const ok = await call('player-limits', 'POST', '/v1/eligibility/check', { player_id: 'P-1001', product: 'sportsbook', amount_minor: 1000 });
check('player-limits allows P-1001', ok.body.eligible === true, ok);

const geo = await call('geo-compliance', 'POST', '/v1/location/check', { player_id: 'P-1004', product: 'casino' });
check('geo-compliance blocks casino in NY', geo.body.allowed === false, geo);

const legacy = await call('bets', 'POST', '/v1/bets', { player_id: 'P-1001', selections: [{ market_id: 'MKT-ML-001', outcome_id: 'OUT-HAWKS' }], stake: 10.0 });
check('bets rejects legacy `stake` with a clear message', legacy.status === 400 && legacy.body.replacement === 'stake_minor', legacy);

const claim = await call('promotions', 'POST', '/v1/boosts/claim', { boost_id: boost.body.boost_id, player_id: 'P-1001' });
check('P-1001 claims the boost', claim.status === 201, claim);

const bet = await call('bets', 'POST', '/v1/bets', { player_id: 'P-1001', selections: [{ market_id: 'MKT-ML-001', outcome_id: 'OUT-HAWKS' }], stake_minor: 1000, boost_id: boost.body.boost_id });
check('boosted bet accepted with rewards earned', bet.status === 201 && bet.body.rewards_earned_minor === 100, bet);

const blocked = await call('bets', 'POST', '/v1/bets', { player_id: 'P-1003', selections: [{ market_id: 'MKT-ML-001', outcome_id: 'OUT-HAWKS' }], stake_minor: 1000 });
check('bets safety net blocks self-excluded wager', blocked.status === 403, blocked);

const claims = await call('promotions', 'GET', `/v1/boosts/claims?boost_id=${boost.body.boost_id}`);
check('end state: no boost claim for self-excluded P-1003', !claims.body.claims.some((c) => c.player_id === 'P-1003'), claims);

const bal = await call('wallet', 'POST', '/v1/wallet/balance', { player_id: 'P-1001' });
check('wallet shows rewards credited', bal.body.rewards_minor === 1300, bal);

const resetRes = await call('admin', 'POST', '/v1/reset', {});
check('admin reset restores seed state', resetRes.status === 200, resetRes);
