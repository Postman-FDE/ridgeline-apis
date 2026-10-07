// Generates everything Postman and Passport need from lib/catalog.mjs:
//   public/specs/*.openapi.json        -> served by the site; import into Postman (Specs / API Catalog) or Passport (Add resources > API spec)
//   public/postman/*.json              -> collections + environments, served by the site and importable into a workspace
//   passport/endpoints.json            -> method + host + path + secret reference for each endpoint
// Example responses are captured by running the real handlers in-process, so they always match the code.
// Usage: SANDBOX_HOST=your-project.vercel.app npm run build:postman
import { mkdirSync, writeFileSync } from 'node:fs';
import { randomUUID, randomBytes } from 'node:crypto';
import { services, errorSchema } from '../lib/catalog.mjs';
import { KEY_ENV } from '../lib/api/keys.mjs';

// Run against a fresh in-memory store, never a shared Redis.
delete process.env.KV_REST_API_URL;
delete process.env.UPSTASH_REDIS_REST_URL;
// Throwaway keys if none are configured. Keys never appear in the generated files.
for (const env of Object.values(KEY_ENV)) process.env[env] ||= `sk_build_${randomBytes(8).toString('hex')}`;
const { dispatch } = await import('../lib/api/http.mjs');
const { services: handlers } = await import('../lib/api/services/index.mjs');
const keys = Object.fromEntries(Object.entries(KEY_ENV).map(([svc, env]) => [svc, process.env[env]]));
const HOST = process.env.SANDBOX_HOST ?? 'your-project.vercel.app';
const quietLog = console.log;

const root = new URL('..', import.meta.url).pathname;
const out = (rel, data) => {
  const file = root + rel;
  mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log('wrote', rel);
};
const varName = (svc) => `${svc.replace(/-/g, '_')}_key`;

// ---------- 1. Capture example responses from the real handlers ----------
console.log = () => {}; // silence per-call log lines while capturing

const captured = {};
const ctx = {};
const fill = (v) => JSON.parse(JSON.stringify(v ?? null).replace(/\{\{(\w+)\}\}/g, (_, k) => ctx[k] ?? `{{${k}}}`));
for (const svc of services) {
  for (const ep of svc.endpoints) {
    const qs = ep.query ? '?' + ep.query.map((q) => `${q.name}=${encodeURIComponent(fill(q.example))}`).join('&') : '';
    const res = await dispatch(handlers, svc.name, ep.path, new Request(`http://sandbox/${svc.name}${ep.path}${qs}`, {
      method: ep.method,
      headers: { authorization: `Bearer ${keys[svc.name]}`, 'content-type': 'application/json' },
      body: ep.method === 'GET' ? undefined : JSON.stringify(fill(ep.example)),
    }));
    const body = await res.json();
    captured[`${svc.name} ${ep.method} ${ep.path}`] = { status: res.status, body };
    for (const [k, field] of Object.entries(ep.capture ?? {})) ctx[k] = body[field];
  }
}
console.log = quietLog;

// ---------- 2. OpenAPI specs ----------
const specFor = (svc, { legacy = false } = {}) => ({
  openapi: '3.0.3',
  info: {
    title: `Ridgeline ${svc.title}${legacy ? ' (v1, deprecated)' : ''}`,
    version: legacy ? '1.4.0' : svc.version ?? '1.0.0',
    description: legacy
      ? 'DEPRECATED. Superseded by v2 (2026-07). `stake` was a decimal dollar amount. Kept for spec history only.'
      : `${svc.description}\n\nOwner: ${svc.owner}. Ridgeline is a fictional company; all data is sandbox data.`,
    contact: { name: svc.owner },
    'x-owner': svc.owner,
  },
  servers: [
    { url: `https://{host}/${svc.name}`, description: 'Hosted sandbox (route through Passport)', variables: { host: { default: HOST } } },
    { url: `http://localhost:4100/${svc.name}`, description: 'Local (next dev)' },
  ],
  security: [{ bearerAuth: [] }],
  tags: [{ name: svc.name, description: svc.description }],
  paths: Object.fromEntries(
    Object.entries(
      svc.endpoints.reduce((acc, ep) => {
        let request = ep.request;
        let example = ep.example;
        if (legacy && request?.properties?.stake_minor) {
          const { stake_minor, ...rest } = request.properties;
          request = { ...request, required: request.required.map((r) => (r === 'stake_minor' ? 'stake' : r)), properties: { ...rest, stake: { type: 'number', format: 'double', description: 'Stake in dollars, e.g. 10.00.' } } };
          const { stake_minor: _s, ...exRest } = example;
          example = { ...exRest, stake: 10.0 };
        }
        const live = captured[`${svc.name} ${ep.method} ${ep.path}`];
        const op = {
          tags: [svc.name],
          operationId: `${svc.name.replace(/-/g, '_')}_${ep.method.toLowerCase()}_${ep.path.split('/').filter(Boolean).slice(1).join('_')}`,
          summary: ep.summary,
          parameters: (ep.query ?? []).map((q) => ({ name: q.name, in: 'query', required: false, description: q.description, schema: { type: 'string' }, example: q.example.startsWith('{{') ? undefined : q.example })),
          responses: {
            [String(live?.status ?? 200)]: { description: 'Success', content: { 'application/json': { schema: ep.response ?? { type: 'object' }, ...(legacy ? {} : { example: live?.body }) } } },
            400: { description: 'Invalid request', content: { 'application/json': { schema: errorSchema } } },
            401: { description: 'Missing or invalid bearer key (or an unresolved Passport reference)', content: { 'application/json': { schema: errorSchema } } },
          },
        };
        if (request) op.requestBody = { required: true, content: { 'application/json': { schema: request, example: JSON.parse(JSON.stringify(example).replace(/"\{\{boost_id\}\}"/g, '"BST-00001"')) } } };
        if (svc.name === 'bets' && ep.method === 'POST') op.responses[403] = { description: 'Player not eligible or product not available in state', content: { 'application/json': { schema: errorSchema } } };
        (acc[ep.path] ??= {})[ep.method.toLowerCase()] = op;
        return acc;
      }, {}),
    ),
  ),
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', description: `Use the Passport reference {{vault:${svc.secretRef}}}. Never a raw key.` } } },
});

for (const svc of services) out(`public/specs/${svc.name}.openapi.json`, specFor(svc));
out('public/specs/history/bets.v1.openapi.json', specFor(services.find((s) => s.name === 'bets'), { legacy: true }));

// ---------- 3. Postman collections ----------
const url = (svc, ep) => {
  const query = (ep.query ?? []).map((q) => ({ key: q.name, value: q.example, description: q.description }));
  const segs = [svc.name, ...ep.path.split('/').filter(Boolean)];
  return { raw: `{{base_url}}/${segs.join('/')}${query.length ? '?' + query.map((q) => `${q.key}=${q.value}`).join('&') : ''}`, host: ['{{base_url}}'], path: segs, ...(query.length ? { query } : {}) };
};
const bearer = (svc) => ({ type: 'bearer', bearer: [{ key: 'token', value: `{{${varName(svc)}}}`, type: 'string' }] });
const body = (ep, example = ep.example) => (ep.method === 'GET' ? undefined : { mode: 'raw', raw: JSON.stringify(example, null, 2), options: { raw: { language: 'json' } } });
const test = (lines) => [{ listen: 'test', script: { type: 'text/javascript', exec: lines } }];

const requestItem = (svc, ep, { name, example, tests, auth } = {}) => {
  const live = captured[`${svc.name} ${ep.method} ${ep.path}`];
  const req = { method: ep.method, header: [{ key: 'Content-Type', value: 'application/json' }], url: url(svc, ep), description: ep.summary, ...(body(ep, example) ? { body: body(ep, example) } : {}), ...(auth ? { auth } : {}) };
  return {
    name: name ?? `${ep.method} ${ep.path} · ${ep.summary}`,
    request: req,
    event: test(tests ?? [`pm.test('2xx', () => pm.expect(pm.response.code).to.be.within(200, 299));`, ...Object.entries(ep.capture ?? {}).map(([k, f]) => `pm.collectionVariables.set('${k}', pm.response.json().${f});`)]),
    response: live ? [{ name: 'Example (captured from the handlers)', originalRequest: req, status: 'OK', code: live.status, header: [{ key: 'Content-Type', value: 'application/json' }], body: JSON.stringify(live.body, null, 2), _postman_previewlanguage: 'json' }] : [],
  };
};

const collection = (name, description, items, extra = {}) => ({
  info: { _postman_id: randomUUID(), name, description, schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
  item: items,
  ...extra,
});

for (const svc of services) {
  out(
    `public/postman/${svc.name}.postman_collection.json`,
    collection(
      `Ridgeline · ${svc.title}`,
      `${svc.description}\n\n**Owner:** ${svc.owner}\n**Auth:** Bearer \`{{${varName(svc.name)}}}\`. In the Passport environment this is \`{{vault:${svc.secretRef}}}\`, so the Passport Secure Access Proxy injects the real key. No one holds the raw key.`,
      svc.endpoints.map((ep) => requestItem(svc, ep)),
      { auth: bearer(svc.name), variable: [{ key: 'boost_id', value: 'BST-00001' }] },
    ),
  );
}

// E2E: the ticket done right. Order matters; run with the Collection Runner.
const S = Object.fromEntries(services.map((s) => [s.name, s]));
const E = (svc, method, path) => S[svc].endpoints.find((e) => e.method === method && e.path === path);
const step = (n, svc, method, path, example, tests, name) => requestItem(S[svc], E(svc, method, path), { name: `${n}. ${name}`, example, tests, auth: bearer(svc) });
const elig = (pid) => ({ player_id: pid, product: 'sportsbook', amount_minor: 1000 });
out(
  'public/postman/e2e-championship-boost.postman_collection.json',
  collection(
    'Ridgeline · Championship Rewards Boost (E2E)',
    'The ticket, done right: create the boost, check **player-limits** and **geo-compliance** before every offer, claim only for eligible players, place a boosted bet in `stake_minor`, then assert the **end state**: no self-excluded or cool-off player holds a claim. Run in order with the Collection Runner. Each request uses its own service key via a Passport reference.',
    [
      step(1, 'promotions', 'POST', '/v1/boosts', E('promotions', 'POST', '/v1/boosts').example, ["pm.test('boost created', () => pm.response.to.have.status(201));", "pm.collectionVariables.set('boost_id', pm.response.json().boost_id);"], 'Create the championship boost'),
      step(2, 'player-limits', 'POST', '/v1/eligibility/check', elig('P-1001'), ["pm.test('P-1001 may receive promotions', () => pm.expect(pm.response.json().may_receive_promotions).to.be.true);"], 'Eligibility: P-1001 (NJ, active)'),
      step(3, 'player-limits', 'POST', '/v1/eligibility/check', elig('P-1003'), ["const r = pm.response.json();", "pm.test('P-1003 is self-excluded', () => pm.expect(r.reasons).to.include('SELF_EXCLUDED'));", "pm.test('P-1003 must NOT receive promotions', () => pm.expect(r.may_receive_promotions).to.be.false);"], 'Eligibility: P-1003 (self-excluded) → do not offer'),
      step(4, 'player-limits', 'POST', '/v1/eligibility/check', elig('P-1005'), ["pm.test('P-1005 cool-off blocks promotions', () => pm.expect(pm.response.json().may_receive_promotions).to.be.false);"], 'Eligibility: P-1005 (cool-off) → do not offer'),
      step(5, 'geo-compliance', 'POST', '/v1/location/check', { player_id: 'P-1004', product: 'casino' }, ["pm.test('casino not offered in NY', () => pm.expect(pm.response.json().allowed).to.be.false);"], 'Geo: P-1004 casino in NY → sportsbook only'),
      step(6, 'promotions', 'POST', '/v1/boosts/claim', { boost_id: '{{boost_id}}', player_id: 'P-1001' }, ["pm.test('claimed', () => pm.response.to.have.status(201));"], 'Claim boost for eligible P-1001'),
      step(7, 'bets', 'POST', '/v1/bets', { player_id: 'P-1001', selections: [{ market_id: 'MKT-ML-001', outcome_id: 'OUT-HAWKS' }], stake_minor: 1000, boost_id: '{{boost_id}}' }, ["const b = pm.response.json();", "pm.test('bet accepted', () => pm.response.to.have.status(201));", "pm.test('stake is integer cents', () => pm.expect(Number.isInteger(b.stake_minor)).to.be.true);", "pm.test('Rewards earned = 10% of stake', () => pm.expect(b.rewards_earned_minor).to.eql(100));"], 'Place boosted bet (stake_minor = 1000)'),
      step(8, 'promotions', 'GET', '/v1/boosts/claims', null, ["const ids = pm.response.json().claims.map(c => c.player_id);", "pm.test('END STATE: no claim for self-excluded P-1003', () => pm.expect(ids).to.not.include('P-1003'));", "pm.test('END STATE: no claim for cool-off P-1005', () => pm.expect(ids).to.not.include('P-1005'));"], 'END STATE: no protected player holds a claim'),
      step(9, 'wallet', 'POST', '/v1/wallet/balance', { player_id: 'P-1001' }, ["pm.test('Rewards credited', () => pm.expect(pm.response.json().rewards_minor).to.be.above(1200));"], 'END STATE: Rewards credited to P-1001'),
    ],
    { variable: [{ key: 'boost_id', value: '' }] },
  ),
);

// Consumer contract: what sportsbook-app relies on from bets and player-limits.
// Postman's jsonSchema assertion is plain JSON Schema: turn OpenAPI `nullable` into a null type union.
const toJsonSchema = (schema) => JSON.parse(JSON.stringify(schema), (k, v) => (v && typeof v === 'object' && v.nullable ? (({ nullable, ...rest }) => ({ ...rest, type: [rest.type, 'null'] }))(v) : v));
const betResponse = toJsonSchema(E('bets', 'POST', '/v1/bets').response);
const eligResponse = toJsonSchema(E('player-limits', 'POST', '/v1/eligibility/check').response);
out(
  'public/postman/sportsbook-app-contract.postman_collection.json',
  collection(
    'Ridgeline · sportsbook-app consumer contract',
    'Assertions owned by the **sportsbook-app** team (a consumer of bets and player-limits). Run in CI on every bets / player-limits change: `postman collection run <id> -e <env>`. A change that passes the producer\'s own tests but breaks these fails the build.',
    [
      step(1, 'bets', 'POST', '/v1/bets', { player_id: 'P-1001', selections: [{ market_id: 'MKT-TOT-001', outcome_id: 'OUT-OVER' }], stake_minor: 500 }, ["pm.test('bet response matches sportsbook-app contract', () => pm.response.to.have.jsonSchema(" + JSON.stringify(betResponse) + '));', "pm.test('stake echoed in cents', () => pm.expect(pm.response.json().stake_minor).to.eql(500));"], 'bets: response shape the app renders'),
      step(2, 'bets', 'POST', '/v1/bets', { player_id: 'P-1001', selections: [{ market_id: 'MKT-TOT-001', outcome_id: 'OUT-OVER' }], stake: 5.0 }, ["pm.test('legacy `stake` is rejected, not silently accepted', () => pm.response.to.have.status(400));", "pm.test('error names the replacement field', () => pm.expect(pm.response.json().replacement).to.eql('stake_minor'));"], 'bets: legacy `stake` is rejected loudly'),
      step(3, 'player-limits', 'POST', '/v1/eligibility/check', elig('P-1003'), ["pm.test('eligibility response matches contract', () => pm.response.to.have.jsonSchema(" + JSON.stringify(eligResponse) + '));', "pm.test('may_receive_promotions present for self-excluded', () => pm.expect(pm.response.json().may_receive_promotions).to.be.false);"], 'player-limits: fields the app gates offers on'),
    ],
  ),
);

// ---------- 4. Environments ----------
const env = (name, baseUrl, valueFor, note) => ({
  id: randomUUID(),
  name,
  values: [
    { key: 'base_url', value: baseUrl, type: 'default', enabled: true },
    ...services.map((s) => ({ key: varName(s.name), value: valueFor(s), type: 'secret', enabled: true })),
  ],
  _postman_variable_scope: 'environment',
  _postman_note: note,
});
out('public/postman/sandbox.postman_environment.json', env('Ridgeline Sandbox · Passport', `https://${HOST}`, (s) => `{{vault:${s.secretRef}}}`, 'Keys are Passport references. Replace each with the exact reference shown by `passport whoami` (named or UUID form).'));
out('public/postman/local.postman_environment.json', env('Ridgeline Sandbox · Local (no keys)', 'http://localhost:4100', () => '', 'next dev on :4100. Keys intentionally blank. For owner-only testing, paste a key from .env.local into the CURRENT value (never the initial value).'));

// ---------- 5. Passport endpoint map ----------
out('passport/endpoints.json', {
  host: HOST,
  note: 'Register each endpoint in Passport (method + host + path are matched exactly). Bind the Authorization header slot to the secret reference. Or import specs/*.openapi.json via Add resources > API spec.',
  namespace: 'Ridgeline Sandbox',
  endpoints: services.flatMap((s) => s.endpoints.map((ep) => ({ namespace_resource_group: s.title, owner: s.owner, method: ep.method, path: `/${s.name}${ep.path}`, secret_label: 'Authorization', secret_reference: s.secretRef, header_template: `Bearer {{vault:${s.secretRef}}}` }))),
});
