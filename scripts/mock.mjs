// Build one mock that serves every Ridgeline API from the saved examples in the per-API collections.
//   npm run mock:build    regenerate postman/mocks/ridgeline from the collections
//   npm run mock:run      serve it locally on :4500
// Then: postman mock push postman/mocks/ridgeline && postman mock deploy <id> --slug <slug> --public --auto-deploy
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const apis = ['markets', 'wallet', 'promotions', 'player-limits', 'bets', 'geo-compliance'];
const combined = {
  info: { name: 'Ridgeline Sandbox (mock)', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
  item: apis.map((api) => {
    const c = JSON.parse(readFileSync(`${root}public/postman/${api}.postman_collection.json`, 'utf8'));
    return { name: c.info.name, item: c.item };
  }),
};
const dir = mkdtempSync(join(tmpdir(), 'ridgeline-mock-'));
const src = join(dir, 'ridgeline-all.postman_collection.json');
writeFileSync(src, JSON.stringify(combined));
const target = root + 'postman/mocks/ridgeline';
const args = existsSync(target + '/config.yaml')
  ? ['mock', 'generate', src, '--update', target]
  : ['mock', 'generate', src, '--output', target, '--name', 'Ridgeline Sandbox (mock)', '--port', '4500'];
try {
  process.stdout.write(execFileSync('postman', args, { encoding: 'utf8' }));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
