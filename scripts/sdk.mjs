// Generate a typed SDK per API from its OpenAPI spec with `postman sdk generate`.
//   npm run sdk                       TypeScript for all six APIs, into sdks/<api>/typescript
//   npm run sdk -- python go          other languages (any the CLI supports)
import { execFileSync } from 'node:child_process';
const apis = ['markets', 'wallet', 'promotions', 'player-limits', 'bets', 'geo-compliance'];
const langs = process.argv.slice(2).length ? process.argv.slice(2) : ['typescript'];
const version = { bets: '2.0.0' };
for (const api of apis) {
  console.log(`\n== ${api} (${langs.join(', ')})`);
  execFileSync('postman', ['sdk', 'generate', `public/specs/${api}.openapi.json`, '-l', ...langs, '-o', `sdks/${api}`, '--name', `ridgeline-${api}`, '--sdk-version', version[api] ?? '1.0.0', '-y'], { stdio: 'inherit' });
}
