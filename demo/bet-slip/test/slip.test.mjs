import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

const markets = [{ market_id: 'MKT-ML-001', outcomes: [{ outcome_id: 'OUT-HAWKS', decimal_odds: 1.77 }] }];
mock.method(globalThis, 'fetch', async () => ({ ok: true, status: 200, json: async () => ({ markets }) }));
const { quote } = await import('../src/slip.mjs');

test('quotes payout in cents', async () => {
  const q = await quote({ event_id: 'EVT-FINAL-2026', market_id: 'MKT-ML-001', outcome_id: 'OUT-HAWKS', stake_minor: 1000 });
  assert.equal(q.potential_payout_minor, 1770);
});
