// Run the Postman collections headlessly with the Postman CLI against the sandbox, as the API owner
// (raw keys from .env.local, written to a temp environment that is deleted afterwards).
//   npm run test:postman                          local server (npm run local / dev / start)
//   SANDBOX_BASE_URL=https://<host> npm run test:postman
//   npm run test:postman -- test-suite e2e-championship-boost   run only these collections
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { KEY_ENV } from '../lib/api/keys.mjs';

const root = new URL('..', import.meta.url).pathname;
const base = process.env.SANDBOX_BASE_URL ?? 'http://localhost:4100';
const env = JSON.parse(readFileSync(root + 'public/postman/local.postman_environment.json', 'utf8'));
for (const v of env.values) {
  if (v.key === 'base_url') v.value = base;
  const svc = v.key.replace(/_key$/, '').replace(/_/g, '-');
  if (KEY_ENV[svc]) {
    v.value = process.env[KEY_ENV[svc]];
    if (!v.value) throw new Error(`${KEY_ENV[svc]} missing. Run: npm run keys > .env.local`);
  }
}
const dir = mkdtempSync(join(tmpdir(), 'ridgeline-'));
const envFile = join(dir, 'env.json');
writeFileSync(envFile, JSON.stringify(env));

const only = process.argv.slice(2);
const files = readdirSync(root + 'public/postman')
  .filter((f) => f.endsWith('.postman_collection.json'))
  .filter((f) => !only.length || only.includes(f.replace('.postman_collection.json', '')))
  .sort((a, b) => (a.startsWith('test-suite') ? -1 : b.startsWith('test-suite') ? 1 : a.localeCompare(b)));

let failed = 0;
try {
  for (const f of files) {
    const name = f.replace('.postman_collection.json', '');
    try {
      const outText = execFileSync('postman', ['collection', 'run', root + 'public/postman/' + f, '-e', envFile], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      const line = outText.split('\n').find((l) => /^\|\s+assertions/.test(l)) ?? '';
      console.log(`PASS  ${name.padEnd(26)} ${line.replace(/[|\s]+/g, ' ').trim()}`);
    } catch (err) {
      failed++;
      const outText = String(err.stdout ?? '') + String(err.stderr ?? '');
      console.log(`FAIL  ${name}`);
      console.log(outText.split('\n').filter((l) => /Fail|AssertionError|Error/.test(l)).slice(0, 15).join('\n'));
    }
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
console.log(failed ? `\n${failed} collection(s) failed against ${base}` : `\nAll collections passed against ${base}`);
process.exit(failed ? 1 : 0);
