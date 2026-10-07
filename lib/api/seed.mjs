// Seed data for the sandbox. Fictional league, teams and players. Amounts are integer minor units (cents).
export const seed = () => ({
  players: {
    'P-1001': { state: 'NJ', status: 'active', daily_wager_limit_minor: 50000, wagered_today_minor: 0 },
    'P-1002': { state: 'PA', status: 'active', daily_wager_limit_minor: 5000, wagered_today_minor: 3000 },
    'P-1003': { state: 'MI', status: 'self_excluded', self_excluded_until: '2027-06-30', daily_wager_limit_minor: 50000, wagered_today_minor: 0 },
    'P-1004': { state: 'NY', status: 'active', daily_wager_limit_minor: 25000, wagered_today_minor: 0 },
    'P-1005': { state: 'NJ', status: 'cool_off', cool_off_until: '2026-12-31T00:00:00Z', daily_wager_limit_minor: 25000, wagered_today_minor: 0 },
  },
  // Product availability by state (illustrative only).
  jurisdictions: {
    NJ: { sportsbook: true, casino: true },
    PA: { sportsbook: true, casino: true },
    MI: { sportsbook: true, casino: true },
    NY: { sportsbook: true, casino: false },
  },
  wallets: {
    'P-1001': { cash_minor: 25000, bonus_minor: 0, rewards_minor: 1200 },
    'P-1002': { cash_minor: 4000, bonus_minor: 500, rewards_minor: 300 },
    'P-1003': { cash_minor: 10000, bonus_minor: 0, rewards_minor: 0 },
    'P-1004': { cash_minor: 15000, bonus_minor: 0, rewards_minor: 800 },
    'P-1005': { cash_minor: 6000, bonus_minor: 0, rewards_minor: 150 },
  },
  events: [{ event_id: 'EVT-FINAL-2026', name: 'Championship Final: Harbor Hawks vs. Summit Bears', starts_at: '2026-10-25T00:30:00Z', league: 'Sandbox League' }],
  markets: [
    {
      market_id: 'MKT-ML-001', event_id: 'EVT-FINAL-2026', type: 'moneyline', name: 'Moneyline',
      outcomes: [
        { outcome_id: 'OUT-HAWKS', name: 'Harbor Hawks', american_odds: -130, decimal_odds: 1.77 },
        { outcome_id: 'OUT-BEARS', name: 'Summit Bears', american_odds: 110, decimal_odds: 2.1 },
      ],
    },
    {
      market_id: 'MKT-TOT-001', event_id: 'EVT-FINAL-2026', type: 'total', name: 'Total Points 47.5',
      outcomes: [
        { outcome_id: 'OUT-OVER', name: 'Over 47.5', american_odds: -110, decimal_odds: 1.91 },
        { outcome_id: 'OUT-UNDER', name: 'Under 47.5', american_odds: -110, decimal_odds: 1.91 },
      ],
    },
  ],
  boosts: {},
  claims: {},
  bets: {},
  credited: {},
  seq: 0,
});
