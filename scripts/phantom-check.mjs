// The phantom-wheel check: every endpoint the agent's code calls, checked against the owning team's spec.
// A coding agent without org context rarely rebuilds a service any more. It assumes the service exists, guesses
// where it lives and what it looks like, and writes a confident client for it. This finds those clients.
//   node scripts/phantom-check.mjs [dir]     (default ~/ridgeline-demo/bet-slip; part of npm run demo:verify)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const root = new URL('..', import.meta.url).pathname;
const dir = process.argv[2] ?? process.env.DEMO_DIR ?? join(homedir(), 'ridgeline-demo/bet-slip');
const SERVICES = ['markets', 'wallet', 'promotions', 'player-limits', 'bets', 'geo-compliance'];
const specs = Object.fromEntries(SERVICES.map((s) => [s, JSON.parse(readFileSync(join(root, `public/specs/${s}.openapi.json`), 'utf8'))]));

const files = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? files(p) : p.endsWith('.mjs') || p.endsWith('.js') ? [p] : [];
});
// `${anything}` -> {param}, drop the query string.
const norm = (p) => p.replace(/\$\{[^}]*\}/g, '{param}').replace(/\?.*$/, '');

// Two shapes agents write: request('wallet', 'GET', `/v1/...`) through the repo's helper, or a literal URL
// with the service prefix (`${base}/wallet/v1/...`).
const calls = new Map();
for (const f of files(join(dir, 'src'))) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/request\(\s*['"]([a-z-]+)['"]\s*,\s*['"]([A-Z]+)['"]\s*,\s*[`'"]([^`'"]+)[`'"]/g)) {
    calls.set(`${m[1]} ${m[2]} ${norm(m[3])}`, { svc: m[1], method: m[2], path: norm(m[3]), file: f });
  }
  for (const m of src.matchAll(/[`'"][^`'"]*?\/(markets|wallet|promotions|player-limits|bets|geo-compliance)(\/v1\/[^`'"\s]*)[`'"]/g)) {
    const k = `${m[1]} * ${norm(m[2])}`;
    if (![...calls.values()].some((c) => c.svc === m[1] && c.path === norm(m[2]))) calls.set(k, { svc: m[1], method: '*', path: norm(m[2]), file: f });
  }
}

const exists = ({ svc, method, path }) => {
  const spec = specs[svc];
  if (!spec) return false;
  const re = (p) => new RegExp('^' + p.replace(/\{[^}]+\}/g, '[^/]+') + '$');
  return Object.entries(spec.paths).some(([p, ops]) =>
    (re(p).test(path) || re(path).test(p)) && (method === '*' || Object.keys(ops).includes(method.toLowerCase())));
};
// Where the capability it was looking for actually lives: match the guessed path's words against every spec.
const words = (p) => p.split(/[/{}_-]+/).filter((w) => w && !['v1', 'param', 'players', 'player', 'id'].includes(w));
const realHome = (path) => {
  const ws = words(path);
  const hits = [];
  for (const [svc, spec] of Object.entries(specs)) {
    for (const [p, ops] of Object.entries(spec.paths)) {
      const text = (svc + ' ' + p + ' ' + Object.values(ops).map((o) => o.summary ?? '').join(' ')).toLowerCase();
      if (ws.some((w) => text.includes(w.toLowerCase()))) hits.push(`${svc} ${Object.keys(ops)[0].toUpperCase()} ${p} (${spec.info['x-owner']})`);
    }
  }
  return [...new Set(hits)].slice(0, 2);
};

const rows = [...calls.values()].sort((a, b) => a.svc.localeCompare(b.svc));
if (!rows.length) {
  console.log(`No calls to Ridgeline services found in ${dir}/src.`);
  process.exit(0);
}
console.log(`Endpoints the agent's code calls, checked against each owner's spec in the workspace:\n`);
let phantoms = 0;
for (const r of rows) {
  const ok = exists(r);
  if (!ok) phantoms++;
  const owner = specs[r.svc]?.info['x-owner'] ?? 'no such service';
  console.log(`  ${ok ? '✓' : '✗'}  ${r.svc.padEnd(15)} ${r.method.padEnd(5)} ${r.path.padEnd(38)} ${ok ? owner : `PHANTOM: ${owner} has no such endpoint`}`);
  if (!ok) for (const h of realHome(r.path)) console.log(`       ↳ the real one: ${h}`);
}
console.log(phantoms
  ? `\n${phantoms} phantom endpoint(s). The agent assumed the wheel exists and guessed where it lives.`
  : `\nEvery endpoint the agent calls exists in its owner's spec.`);
