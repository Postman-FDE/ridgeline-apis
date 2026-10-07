/**
 * Ridgeline Sandbox API client. Each service has its own key, and every key is expected to be a
 * Passport reference ({{vault:...}}). The Passport Secure Access Proxy swaps the reference for
 * the real secret in transit. This process never sees the real key.
 */

export type Service = 'markets' | 'wallet' | 'promotions' | 'player-limits' | 'bets' | 'geo-compliance';

const KEY_ENV: Record<Service, string> = {
  markets: 'RIDGELINE_MARKETS_KEY',
  wallet: 'RIDGELINE_WALLET_KEY',
  promotions: 'RIDGELINE_PROMOTIONS_KEY',
  'player-limits': 'RIDGELINE_PLAYER_LIMITS_KEY',
  bets: 'RIDGELINE_BETS_KEY',
  'geo-compliance': 'RIDGELINE_GEO_COMPLIANCE_KEY',
};

export class SandboxError extends Error {
  constructor(
    public service: Service,
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

const baseUrl = () => {
  const url = process.env.RIDGELINE_BASE_URL;
  if (!url) throw new Error('RIDGELINE_BASE_URL is not set.');
  return url.replace(/\/$/, '');
};

export async function call<T = unknown>(service: Service, method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const key = process.env[KEY_ENV[service]];
  if (!key) throw new SandboxError(service, 0, 'no_credential', `${KEY_ENV[service]} is not set. Request access to ${service} in Passport.`);

  const proxy = process.env.PASSPORT_PROXY_URL || undefined;
  const res = await fetch(`${baseUrl()}/${service}${path}`, {
    method,
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    // Bun's fetch accepts a per-request proxy. With no proxy set, it also honors HTTPS_PROXY.
    ...(proxy ? { proxy } : {}),
  } as RequestInit);

  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: 'non_json', message: text.slice(0, 200) };
  }

  if (!res.ok) {
    // 401 unresolved_reference = the call skipped Passport. 403/407/502 from the proxy usually = no grant / revoked.
    const revokedHint = [403, 407, 502].includes(res.status) && !data.error ? ' (Passport denied the call: the grant may be missing or revoked)' : '';
    throw new SandboxError(service, res.status, data.error ?? 'http_error', `${service} ${method} ${path} -> ${res.status}: ${data.message ?? text.slice(0, 200)}${revokedHint}`);
  }
  return data as T;
}

export type Eligibility = {
  player_id: string;
  product: 'sportsbook' | 'casino';
  eligible: boolean;
  reasons: string[];
  may_receive_promotions: boolean;
  remaining_daily_wager_minor: number;
};

export const sandbox = {
  markets: (event_id: string) => call('markets', 'GET', `/v1/markets?event_id=${encodeURIComponent(event_id)}`),
  createBoost: (b: { name: string; market_id: string; profit_boost_pct: number; rewards_back_pct: number; products: string[] }) => call<{ boost_id: string }>('promotions', 'POST', '/v1/boosts', b),
  claims: (boost_id: string) => call<{ claims: { player_id: string }[] }>('promotions', 'GET', `/v1/boosts/claims?boost_id=${encodeURIComponent(boost_id)}`),
  claim: (boost_id: string, player_id: string) => call('promotions', 'POST', '/v1/boosts/claim', { boost_id, player_id }),
  eligibility: (player_id: string, product: string, amount_minor?: number) => call<Eligibility>('player-limits', 'POST', '/v1/eligibility/check', { player_id, product, ...(amount_minor ? { amount_minor } : {}) }),
  location: (player_id: string, product: string) => call<{ allowed: boolean; state: string; reason: string | null }>('geo-compliance', 'POST', '/v1/location/check', { player_id, product }),
  balance: (player_id: string) => call('wallet', 'POST', '/v1/wallet/balance', { player_id }),
};
