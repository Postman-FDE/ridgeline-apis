// Headless Postman setup: push the generated specs, collections and environments into a workspace
// through the Postman API. Idempotent: items are matched by name and updated in place on re-runs.
//
//   POSTMAN_API_KEY=PMAK-...            (Postman > Settings > API keys; or put it in .env.local)
//   POSTMAN_WORKSPACE_ID=<workspace id> (or --create "Workspace name" [--type personal|team])
//
//   npm run postman:push                       push everything
//   npm run postman:push -- --dry-run          show what would happen
//   npm run postman:push -- --create "Ridgeline API Sandbox" --type personal
//
// Regenerate first if lib/catalog.mjs changed:  SANDBOX_HOST=<host> npm run build:postman
import { readFileSync, readdirSync } from 'node:fs';

const API = 'https://api.getpostman.com';
const key = process.env.POSTMAN_API_KEY;
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const dry = flag('--dry-run');
const root = new URL('..', import.meta.url).pathname;

if (!key) {
  console.error('Set POSTMAN_API_KEY (Postman > Settings > API keys), e.g. in .env.local.');
  process.exit(1);
}

async function pm(method, path, body) {
  if (dry && method !== 'GET') {
    console.log(`  DRY ${method} ${path}`);
    return {};
  }
  const res = await fetch(API + path, {
    method,
    headers: { 'X-Api-Key': key, 'content-type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 300)}`);
  return data;
}

// ---- workspace ----
let workspace = process.env.POSTMAN_WORKSPACE_ID;
if (opt('--create')) {
  const created = await pm('POST', '/workspaces', {
    workspace: { name: opt('--create'), type: opt('--type') ?? 'personal', description: 'Ridgeline API Sandbox: fictional APIs for API Catalog + Passport demos. All data is sandbox data.' },
  });
  workspace = created.workspace?.id;
  console.log(`Created workspace ${workspace}  (export POSTMAN_WORKSPACE_ID=${workspace})`);
}
if (!workspace) {
  console.error('Set POSTMAN_WORKSPACE_ID, or pass --create "Workspace name".');
  process.exit(1);
}
console.log(`Workspace ${workspace}${dry ? '  (dry run)' : ''}`);

const readJson = (p) => JSON.parse(readFileSync(root + p, 'utf8'));

// ---- specs (Spec Hub) ----
console.log('\nSpecs');
const existingSpecs = (await pm('GET', `/specs?workspaceId=${workspace}&limit=100`)).specs ?? [];
const specFiles = [
  ...readdirSync(root + 'public/specs').filter((f) => f.endsWith('.json')).map((f) => `public/specs/${f}`),
  'public/specs/history/bets.v1.openapi.json',
];
for (const file of specFiles) {
  const spec = readJson(file);
  const name = spec.info.title;
  const content = JSON.stringify(spec, null, 2);
  const found = existingSpecs.find((s) => s.name === name);
  if (found) {
    await pm('PATCH', `/specs/${found.id}/files/index.json`, { content });
    console.log(`  updated  ${name}`);
  } else {
    await pm('POST', `/specs?workspaceId=${workspace}`, { name, type: 'OPENAPI:3.0', files: [{ path: 'index.json', content }] });
    console.log(`  created  ${name}`);
  }
}

// ---- collections ----
console.log('\nCollections');
const existingCollections = (await pm('GET', `/collections?workspace=${workspace}`)).collections ?? [];
for (const f of readdirSync(root + 'public/postman').filter((f) => f.endsWith('.postman_collection.json')).sort()) {
  const collection = readJson(`public/postman/${f}`);
  delete collection.info._postman_id; // let Postman assign IDs
  const found = existingCollections.find((c) => c.name === collection.info.name);
  if (found) {
    await pm('PUT', `/collections/${found.uid}`, { collection });
    console.log(`  updated  ${collection.info.name}`);
  } else {
    await pm('POST', `/collections?workspace=${workspace}`, { collection });
    console.log(`  created  ${collection.info.name}`);
  }
}

// ---- environments ----
console.log('\nEnvironments');
const existingEnvs = (await pm('GET', `/environments?workspace=${workspace}`)).environments ?? [];
for (const f of readdirSync(root + 'public/postman').filter((f) => f.endsWith('.postman_environment.json')).sort()) {
  const env = readJson(`public/postman/${f}`);
  const environment = { name: env.name, values: env.values.map(({ key: k, value, type, enabled }) => ({ key: k, value, type, enabled })) };
  const found = existingEnvs.find((e) => e.name === env.name);
  if (found) {
    await pm('PUT', `/environments/${found.uid}`, { environment });
    console.log(`  updated  ${env.name}`);
  } else {
    await pm('POST', `/environments?workspace=${workspace}`, { environment });
    console.log(`  created  ${env.name}`);
  }
}

console.log(`\nDone. Open: https://go.postman.co/workspace/${workspace}`);
console.log('Next (in the app): link each collection to its spec, set owners, add a monitor on player-limits, register the APIs in the API Catalog.');
