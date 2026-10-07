// All service config comes from env. In the Passport setup each *_KEY is a {{vault:...}} reference.
export const config = {
  baseUrl: (process.env.SANDBOX_BASE_URL ?? 'http://localhost:4100').replace(/\/$/, ''),
  keys: {
    markets: process.env.MARKETS_KEY,
    bets: process.env.BETS_KEY,
    promotions: process.env.PROMOTIONS_KEY,
    wallet: process.env.WALLET_KEY,
  },
  port: Number(process.env.PORT ?? 4200),
};
