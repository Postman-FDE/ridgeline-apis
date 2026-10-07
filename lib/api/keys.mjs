// Bearer keys for each API. Read from env only: never committed.
//   Local:  .env.local (copy from .env.example; `npm run keys` prints a fresh set)
//   Vercel: Project > Settings > Environment Variables (or scripts/vercel-env.sh)
// These are the "real secrets". Store them in Passport's vault and give clients only the
// {{vault:<reference>}} references Passport generates.
export const KEY_ENV = {
  markets: 'API_KEY_MARKETS',
  wallet: 'API_KEY_WALLET',
  promotions: 'API_KEY_PROMOTIONS',
  'player-limits': 'API_KEY_PLAYER_LIMITS',
  bets: 'API_KEY_BETS',
  'geo-compliance': 'API_KEY_GEO_COMPLIANCE',
  admin: 'API_KEY_ADMIN',
};

export const keyFor = (service) => process.env[KEY_ENV[service]];
