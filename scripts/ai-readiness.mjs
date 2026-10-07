// Score every spec and collection with Postman's AI-readiness check, write docs/ai-readiness.md,
// and fail if anything drops below the threshold (a CI gate).
//   npm run ai-readiness                 threshold 75
//   AI_READINESS_MIN=80 npm run ai-readiness
import { execFileSync } from 'node:child_process';
import { readdirSync, writeFileSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const min = Number(process.env.AI_READINESS_MIN ?? 75);
const run = (kind, file) => JSON.parse(execFileSync('postman', [kind, 'ai-readiness', file, '--output', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));

const rows = [];
for (const f of readdirSync(root + 'public/specs').filter((x) => x.endsWith('.json')).sort()) rows.push(['spec', f.replace('.openapi.json', ''), run('spec', root + 'public/specs/' + f)]);
for (const f of readdirSync(root + 'public/postman').filter((x) => x.endsWith('.postman_collection.json')).sort()) rows.push(['collection', f.replace('.postman_collection.json', ''), run('collection', root + 'public/postman/' + f)]);

const line = ([kind, name, r]) => `| ${kind} | ${name} | **${r.readiness.score_0_100}** | ${r.readiness.bucket} | ${r.complexity.bucket} | ${r.docCoverage.bucket} |`;
const recs = [...new Set(rows.flatMap(([, , r]) => r.recommendations))];
const md = `# AI readiness

Scored with \`postman spec ai-readiness\` and \`postman collection ai-readiness\` (Postman CLI). The score estimates how reliably an AI agent can use an API: it is driven mostly by **complexity** (auth, error surface, parameters, pagination, rate limiting, nesting), adjusted by **documentation coverage**. Simpler and better documented scores higher.

Gate: every item must score at least **${min}**. Regenerate with \`npm run ai-readiness\`.

| Kind | Name | Score | Rating | Complexity | Doc coverage |
|---|---|---|---|---|---|
${rows.map(line).join('\n')}

## What the scorer recommends (deduplicated, verbatim from the CLI)

${recs.map((r) => `- ${r}`).join('\n')}

## What we changed, and what we deliberately did not

- **Credential acquisition** is documented in every spec's security scheme and every collection: find the API in the catalog, request the resource group in Passport, wait for the owner's approval, use the \`{{vault:...}}\` reference.
- **Every error code carries a handling hint**: whether it is recoverable, and what a client or agent should do (fix input, re-authenticate, route through the proxy, or stop).
- **We tried adding a real rate limit** (600 requests a minute per key, \`X-RateLimit-*\` headers, \`429\` with \`Retry-After\`) because the scorer flagged rate limiting as undetectable. Scores dropped from 80 to 70: rate limiting counts as complexity an agent has to handle. The sandbox has no real need for one, so we took it out.
- **We kept the full error surface.** Fewer documented errors would score higher, but agents branch on those codes; removing them would trade real usefulness for points.
`;
writeFileSync(root + 'docs/ai-readiness.md', md);
const failing = rows.filter(([, , r]) => r.readiness.score_0_100 < min);
for (const [kind, name, r] of rows) console.log(`${r.readiness.score_0_100 >= min ? 'PASS' : 'FAIL'}  ${kind.padEnd(10)} ${name.padEnd(26)} ${r.readiness.score_0_100}`);
console.log(failing.length ? `\n${failing.length} below ${min}` : `\nAll ${rows.length} at or above ${min}. Report: docs/ai-readiness.md`);
process.exit(failing.length ? 1 : 0);
