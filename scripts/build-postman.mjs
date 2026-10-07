// Generates everything Postman and Passport need from lib/catalog.mjs:
//   public/specs/*.openapi.json        -> served by the site; import into Postman (Specs / API Catalog) or Passport (Add resources > API spec)
//   public/postman/*.json              -> collections + environments, served by the site and importable into a workspace
//   passport/endpoints.json            -> method + host + path + secret reference for each endpoint
// Example responses are captured by running the real handlers in-process, so they always match the code.
// Usage: SANDBOX_HOST=your-project.vercel.app npm run build:postman
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
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
// `postman workspace push` writes cloud IDs back into these files. Keep them across rebuilds
// so pushes update in place instead of churning IDs.
const keepIds = (fresh, old) => {
  if (!old) return fresh;
  if (fresh.info && old.info?._postman_id) fresh.info._postman_id = old.info._postman_id;
  if (!fresh.info && old.id) fresh.id = old.id;
  const walk = (items = [], prev = []) => {
    for (const it of items) {
      const match = prev.find((p) => p.name === it.name);
      if (!match) continue;
      if (match.id) it.id = match.id;
      for (const r of it.response ?? []) {
        const rm = (match.response ?? []).find((x) => x.name === r.name);
        if (rm?.id) r.id = rm.id;
      }
      if (it.item) walk(it.item, match.item);
    }
  };
  walk(fresh.item, old.item);
  return fresh;
};
const out = (rel, data) => {
  const file = root + rel;
  mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true });
  if (rel.startsWith('public/postman/') && existsSync(file)) data = keepIds(data, JSON.parse(readFileSync(file, 'utf8')));
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
            500: { description: 'Unexpected server error', content: { 'application/json': { schema: errorSchema } } },
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

// Postman's jsonSchema assertion is plain JSON Schema: turn OpenAPI `nullable` into a null type union.
const asJsonSchema = (schema) => JSON.parse(JSON.stringify(schema), (k, v) => (v && typeof v === 'object' && v.nullable ? (({ nullable, ...rest }) => ({ ...rest, type: [rest.type, 'null'] }))(v) : v));
const defaultTests = (ep) => [
  `pm.test('status is 2xx', () => pm.expect(pm.response.code).to.be.within(200, 299));`,
  `pm.test('responds in under 2s', () => pm.expect(pm.response.responseTime).to.be.below(2000));`,
  `pm.test('JSON content type', () => pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json'));`,
  ...(ep.response ? [`pm.test('matches the documented response schema', () => pm.response.to.have.jsonSchema(${JSON.stringify(asJsonSchema(ep.response))}));`] : []),
  ...Object.entries(ep.capture ?? {}).map(([k, f]) => `pm.collectionVariables.set('${k}', pm.response.json().${f});`),
];
// Postman cloud rewrites '/' and ':' in item names, which would make every push churn. Avoid them.
const safeName = (n) => n.replace(/\s*:\s*/g, ' · ').replace(/\//g, ' ').replace(/\s+/g, ' ').trim();
const requestItem = (svc, ep, { name, example, tests, auth } = {}) => {
  const live = captured[`${svc.name} ${ep.method} ${ep.path}`];
  const req = { method: ep.method, header: [{ key: 'Content-Type', value: 'application/json' }], url: url(svc, ep), description: ep.summary, ...(body(ep, example) ? { body: body(ep, example) } : {}), ...(auth ? { auth } : {}) };
  return {
    name: safeName(name ?? ep.summary),
    request: req,
    event: test(tests ?? defaultTests(ep)),
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

// ---------- 3b. Test suite: auth, functional, business rules, negative cases ----------
// Order-independent against shared state: every test creates what it needs (e.g. its own boost).
const tr = (name, svc, method, path, tests, { json, query, auth = bearer(svc), headers = [], pre } = {}) => {
  const q = query ? Object.entries(query).map(([key, value]) => ({ key, value })) : [];
  const segs = [svc, ...path.split('/').filter(Boolean)];
  return {
    name: safeName(name),
    request: {
      method,
      header: [{ key: 'Content-Type', value: 'application/json' }, ...headers],
      url: { raw: `{{base_url}}/${segs.join('/')}${q.length ? '?' + q.map((x) => `${x.key}=${x.value}`).join('&') : ''}`, host: ['{{base_url}}'], path: segs, ...(q.length ? { query: q } : {}) },
      auth,
      ...(json !== undefined ? { body: { mode: 'raw', raw: JSON.stringify(json, null, 2), options: { raw: { language: 'json' } } } } : {}),
    },
    event: [...(pre ? [{ listen: 'prerequest', script: { type: 'text/javascript', exec: pre } }] : []), { listen: 'test', script: { type: 'text/javascript', exec: tests } }],
  };
};
const folder = (name, description, item) => ({ name, description, item });
const status = (code) => `pm.test('status ${code}', () => pm.response.to.have.status(${code}));`;
const errorIs = (code) => `pm.test('error code is ${code}', () => pm.expect(pm.response.json().error).to.eql('${code}'));`;
const noAuth = { type: 'noauth' };
const ML = [{ market_id: 'MKT-ML-001', outcome_id: 'OUT-HAWKS' }];
const newBoost = (name) => ({ name, market_id: 'MKT-ML-001', profit_boost_pct: 25, rewards_back_pct: 10, products: ['sportsbook', 'casino'] });
const authProbe = { markets: ['GET', '/v1/events'], wallet: ['POST', '/v1/wallet/balance', { player_id: 'P-1001' }], promotions: ['GET', '/v1/boosts'], 'player-limits': ['POST', '/v1/eligibility/check', { player_id: 'P-1001', product: 'sportsbook' }], bets: ['GET', '/v1/bets'], 'geo-compliance': ['POST', '/v1/location/check', { player_id: 'P-1001', product: 'casino' }] };
const other = (svc) => (svc === 'markets' ? 'wallet' : 'markets');

out(
  'public/postman/test-suite.postman_collection.json',
  collection(
    'Ridgeline · Test Suite',
    'Automated tests for every Ridgeline API: **auth** (each API only accepts its own key, and rejects unresolved Passport references), **functional** behavior, **business rules** (self-exclusion, cool-off, daily limits, state availability, the v2 `stake_minor` contract) and **negative cases**. Run with the Collection Runner, `postman collection run`, or Newman. Every request also checks response time and JSON content type (collection-level tests).',
    [
      folder('Auth', 'Each API accepts only its own bearer key.', Object.entries(authProbe).flatMap(([svc, [method, path, json]]) => [
        tr(`${svc}: no key → 401`, svc, method, path, [status(401), errorIs('unauthorized')], { json, auth: noAuth }),
        tr(`${svc}: another API's key → 401`, svc, method, path, [status(401), errorIs('unauthorized')], { json, auth: bearer(other(svc)) }),
        tr(`${svc}: unresolved Passport reference → 401`, svc, method, path, [status(401), "pm.test('rejected as unresolved reference (or unauthorized if the client resolved it)', () => pm.expect(['unresolved_reference', 'unauthorized']).to.include(pm.response.json().error));"], {
          json, auth: noAuth,
          pre: ["// Built in a script so the client sends the literal reference instead of resolving it.", `pm.request.headers.upsert({ key: 'Authorization', value: 'Bearer ' + '{' + '{vault:RIDGELINE_${svc.replace(/-/g, '_').toUpperCase()}_KEY}' + '}' });`],
        }),
        tr(`${svc}: own key → 2xx`, svc, method, path, ["pm.test('status 2xx', () => pm.expect(pm.response.code).to.be.within(200, 299));"], { json }),
      ])),
      folder('Markets', 'Events and odds.', [
        tr('events include the championship final', 'markets', 'GET', '/v1/events', [status(200), "pm.test('EVT-FINAL-2026 listed', () => pm.expect(pm.response.json().events.map(e => e.event_id)).to.include('EVT-FINAL-2026'));"]),
        tr('markets filter by event, odds are valid', 'markets', 'GET', '/v1/markets', [status(200), "const m = pm.response.json().markets;", "pm.test('only the requested event', () => m.forEach(x => pm.expect(x.event_id).to.eql('EVT-FINAL-2026')));", "pm.test('every outcome has decimal odds > 1', () => m.flatMap(x => x.outcomes).forEach(o => pm.expect(o.decimal_odds).to.be.above(1)));"], { query: { event_id: 'EVT-FINAL-2026' } }),
        tr('unknown event returns an empty list', 'markets', 'GET', '/v1/markets', [status(200), "pm.test('no markets', () => pm.expect(pm.response.json().markets).to.have.length(0));"], { query: { event_id: 'EVT-NOPE' } }),
      ]),
      folder('Player limits (responsible gaming)', 'The single source of truth for player protection.', [
        tr('P-1001 active → eligible', 'player-limits', 'POST', '/v1/eligibility/check', [status(200), "const r = pm.response.json();", "pm.test('eligible', () => pm.expect(r.eligible).to.be.true);", "pm.test('may receive promotions', () => pm.expect(r.may_receive_promotions).to.be.true);"], { json: { player_id: 'P-1001', product: 'sportsbook', amount_minor: 1000 } }),
        tr('P-1003 self-excluded → blocked, no promotions', 'player-limits', 'POST', '/v1/eligibility/check', [status(200), "const r = pm.response.json();", "pm.test('not eligible', () => pm.expect(r.eligible).to.be.false);", "pm.test('reason SELF_EXCLUDED', () => pm.expect(r.reasons).to.include('SELF_EXCLUDED'));", "pm.test('must not receive promotions', () => pm.expect(r.may_receive_promotions).to.be.false);"], { json: { player_id: 'P-1003', product: 'sportsbook' } }),
        tr('P-1005 cool-off → blocked, no promotions', 'player-limits', 'POST', '/v1/eligibility/check', [status(200), "const r = pm.response.json();", "pm.test('reason COOL_OFF', () => pm.expect(r.reasons).to.include('COOL_OFF'));", "pm.test('must not receive promotions', () => pm.expect(r.may_receive_promotions).to.be.false);"], { json: { player_id: 'P-1005', product: 'casino' } }),
        tr('P-1002 over daily limit → wager blocked, promotions still allowed', 'player-limits', 'POST', '/v1/eligibility/check', [status(200), "const r = pm.response.json();", "pm.test('reason DAILY_WAGER_LIMIT', () => pm.expect(r.reasons).to.include('DAILY_WAGER_LIMIT'));", "pm.test('limit alone does not block promotions', () => pm.expect(r.may_receive_promotions).to.be.true);"], { json: { player_id: 'P-1002', product: 'sportsbook', amount_minor: 1000000 } }),
        tr('invalid product → 400', 'player-limits', 'POST', '/v1/eligibility/check', [status(400), errorIs('invalid_product')], { json: { player_id: 'P-1001', product: 'poker' } }),
        tr('missing player_id → 400', 'player-limits', 'POST', '/v1/eligibility/check', [status(400), errorIs('missing_fields')], { json: { product: 'sportsbook' } }),
        tr('unknown player → 404', 'player-limits', 'POST', '/v1/eligibility/check', [status(404), errorIs('player_not_found')], { json: { player_id: 'P-9999', product: 'sportsbook' } }),
        tr('limits for P-1002', 'player-limits', 'POST', '/v1/limits', [status(200), "const r = pm.response.json();", "pm.test('integer cents', () => { pm.expect(Number.isInteger(r.daily_wager_limit_minor)).to.be.true; pm.expect(Number.isInteger(r.wagered_today_minor)).to.be.true; });"], { json: { player_id: 'P-1002' } }),
      ]),
      folder('Geo compliance', 'Product availability by state.', [
        tr('NY: casino not available', 'geo-compliance', 'POST', '/v1/location/check', [status(200), "pm.test('not allowed', () => pm.expect(pm.response.json().allowed).to.be.false);", "pm.test('reason given', () => pm.expect(pm.response.json().reason).to.eql('PRODUCT_NOT_AVAILABLE_IN_STATE'));"], { json: { player_id: 'P-1004', product: 'casino' } }),
        tr('NY: sportsbook available', 'geo-compliance', 'POST', '/v1/location/check', [status(200), "pm.test('allowed', () => pm.expect(pm.response.json().allowed).to.be.true);"], { json: { player_id: 'P-1004', product: 'sportsbook' } }),
        tr('NJ: casino available', 'geo-compliance', 'POST', '/v1/location/check', [status(200), "pm.test('allowed', () => pm.expect(pm.response.json().allowed).to.be.true);"], { json: { player_id: 'P-1001', product: 'casino' } }),
      ]),
      folder('Wallet', 'Balances and idempotent rewards credits.', [
        tr('balance is integer cents', 'wallet', 'POST', '/v1/wallet/balance', [status(200), "const w = pm.response.json();", "pm.test('integer amounts', () => ['cash_minor', 'bonus_minor', 'rewards_minor'].forEach(k => pm.expect(Number.isInteger(w[k])).to.be.true));", "pm.collectionVariables.set('rewards_before', w.rewards_minor);"], { json: { player_id: 'P-1004' } }),
        tr('credit rewards (new idempotency key)', 'wallet', 'POST', '/v1/wallet/rewards/credit', [status(201), "pm.test('balance increased by 50', () => pm.expect(pm.response.json().rewards_minor).to.eql(Number(pm.collectionVariables.get('rewards_before')) + 50));", "pm.collectionVariables.set('rewards_after', pm.response.json().rewards_minor);"], { json: { player_id: 'P-1004', amount_minor: 50, reason: 'test suite', idempotency_key: '{{credit_key}}' }, pre: ["pm.collectionVariables.set('credit_key', 'suite-' + Date.now());"] }),
        tr('replaying the same idempotency key does not double-credit', 'wallet', 'POST', '/v1/wallet/rewards/credit', [status(201), "pm.test('balance unchanged on replay', () => pm.expect(pm.response.json().rewards_minor).to.eql(Number(pm.collectionVariables.get('rewards_after'))));"], { json: { player_id: 'P-1004', amount_minor: 50, reason: 'test suite', idempotency_key: '{{credit_key}}' } }),
        tr('decimal amount → 400', 'wallet', 'POST', '/v1/wallet/rewards/credit', [status(400), errorIs('invalid_amount')], { json: { player_id: 'P-1004', amount_minor: 0.5, reason: 'x', idempotency_key: 'x' } }),
      ]),
      folder('Promotions', 'Boosts and claims (callers must check eligibility first).', [
        tr('create a boost', 'promotions', 'POST', '/v1/boosts', [status(201), "const b = pm.response.json();", "pm.test('has a boost_id', () => pm.expect(b.boost_id).to.match(/^BST-/));", "pm.test('active', () => pm.expect(b.status).to.eql('active'));", "pm.collectionVariables.set('suite_boost_id', b.boost_id);"], { json: newBoost('Test Suite Boost') }),
        tr('unknown market → 404', 'promotions', 'POST', '/v1/boosts', [status(404), errorIs('market_not_found')], { json: { ...newBoost('Bad'), market_id: 'MKT-NOPE' } }),
        tr('claim for eligible P-1001', 'promotions', 'POST', '/v1/boosts/claim', [status(201), "pm.test('claim recorded', () => pm.expect(pm.response.json().player_id).to.eql('P-1001'));"], { json: { boost_id: '{{suite_boost_id}}', player_id: 'P-1001' } }),
        tr('claiming twice is idempotent', 'promotions', 'POST', '/v1/boosts/claim', [status(201), "pm.collectionVariables.set('suite_claim_id', pm.response.json().claim_id);"], { json: { boost_id: '{{suite_boost_id}}', player_id: 'P-1001' } }),
        tr('claims list has exactly one claim for P-1001', 'promotions', 'GET', '/v1/boosts/claims', [status(200), "const c = pm.response.json().claims.filter(x => x.player_id === 'P-1001');", "pm.test('one claim', () => pm.expect(c).to.have.length(1));"], { query: { boost_id: '{{suite_boost_id}}' } }),
        tr('unknown boost → 404', 'promotions', 'POST', '/v1/boosts/claim', [status(404), errorIs('boost_not_found')], { json: { boost_id: 'BST-NOPE', player_id: 'P-1001' } }),
      ]),
      folder('Bets', 'v2 contract (stake_minor) and platform safety nets.', [
        tr('valid bet: payout = stake × odds', 'bets', 'POST', '/v1/bets', [status(201), "const b = pm.response.json();", "pm.test('accepted', () => pm.expect(b.status).to.eql('accepted'));", "pm.test('payout 1000 × 1.77 = 1770', () => pm.expect(b.potential_payout_minor).to.eql(1770));", "pm.test('no rewards without a boost', () => pm.expect(b.rewards_earned_minor).to.eql(0));"], { json: { player_id: 'P-1001', selections: ML, stake_minor: 1000 } }),
        tr('boosted bet: 25% profit boost + 10% rewards', 'bets', 'POST', '/v1/bets', [status(201), "const b = pm.response.json();", "pm.test('boosted payout 1000 + 770 × 1.25 = 1963', () => pm.expect(b.potential_payout_minor).to.eql(1963));", "pm.test('rewards = 10% of stake', () => pm.expect(b.rewards_earned_minor).to.eql(100));"], { json: { player_id: 'P-1001', selections: ML, stake_minor: 1000, boost_id: '{{suite_boost_id}}' } }),
        tr('legacy `stake` field → 400 naming the replacement', 'bets', 'POST', '/v1/bets', [status(400), errorIs('unsupported_field'), "pm.test('points to stake_minor', () => pm.expect(pm.response.json().replacement).to.eql('stake_minor'));"], { json: { player_id: 'P-1001', selections: ML, stake: 10.0 } }),
        tr('decimal stake_minor → 400', 'bets', 'POST', '/v1/bets', [status(400), errorIs('invalid_amount')], { json: { player_id: 'P-1001', selections: ML, stake_minor: 10.5 } }),
        tr('self-excluded P-1003 → 403', 'bets', 'POST', '/v1/bets', [status(403), errorIs('player_not_eligible'), "pm.test('reason SELF_EXCLUDED', () => pm.expect(pm.response.json().reasons).to.include('SELF_EXCLUDED'));"], { json: { player_id: 'P-1003', selections: ML, stake_minor: 1000 } }),
        tr('casino in NY → 403', 'bets', 'POST', '/v1/bets', [status(403), errorIs('product_not_available')], { json: { player_id: 'P-1004', product: 'casino', selections: ML, stake_minor: 1000 } }),
        tr('boost not claimed → 409', 'bets', 'POST', '/v1/bets', [status(409), errorIs('boost_not_claimed')], { json: { player_id: 'P-1004', selections: ML, stake_minor: 1000, boost_id: '{{suite_boost_id}}' } }),
        tr('unknown selection → 404', 'bets', 'POST', '/v1/bets', [status(404), errorIs('selection_not_found')], { json: { player_id: 'P-1001', selections: [{ market_id: 'MKT-ML-001', outcome_id: 'OUT-NOPE' }], stake_minor: 1000 } }),
      ]),
    ],
    {
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: ["pm.test('responds in under 2s', () => pm.expect(pm.response.responseTime).to.be.below(2000));", "pm.test('JSON content type', () => pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json'));"] } }],
      variable: [{ key: 'suite_boost_id', value: '' }, { key: 'credit_key', value: '' }, { key: 'rewards_before', value: '' }, { key: 'rewards_after', value: '' }, { key: 'suite_claim_id', value: '' }],
    },
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
