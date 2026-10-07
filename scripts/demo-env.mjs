// Writes the demo's local-only files from .env.local (all gitignored, never deployed):
//   demo/bet-slip/.env.before   raw keys, the "before" state (trap #3)
//   demo/bet-slip/.env          copy of .env.before
//   demo/bet-slip/.env.passport Passport references only (the "after" state)
//   demo/bet-slip/.agent/session-2026-10-05.jsonl   a planted agent transcript that leaked keys
//   demo/agent/.env             boost-ops config with Passport references
// Usage: SANDBOX_BASE_URL=https://your-project.vercel.app npm run demo:env
import { mkdirSync, writeFileSync } from 'node:fs';
import { KEY_ENV } from '../lib/api/keys.mjs';

const base = process.env.SANDBOX_BASE_URL ?? 'https://your-project.vercel.app';
const raw = (svc) => {
  const v = process.env[KEY_ENV[svc]];
  if (!v) throw new Error(`${KEY_ENV[svc]} missing. Run: npm run keys > .env.local`);
  return v;
};
const ref = (svc) => `{{vault:RIDGELINE_${svc.replace(/-/g, '_').toUpperCase()}_KEY}}`;
const w = (p, s) => { mkdirSync(p.slice(0, p.lastIndexOf('/')), { recursive: true }); writeFileSync(p, s); console.log('wrote', p); };

const before = `# bet-slip local env: the "before" state. Raw keys pasted from a teammate, as most repos do today.
SANDBOX_BASE_URL=${base}
MARKETS_KEY=${raw('markets')}
BETS_KEY=${raw('bets')}
PROMOTIONS_KEY=${raw('promotions')}
WALLET_KEY=${raw('wallet')}
`;
w('demo/bet-slip/.env.before', before);
w('demo/bet-slip/.env', before);
w('demo/bet-slip/.env.passport', `# bet-slip env: the "after" state. Only Passport references (replace with what \`passport whoami\` prints).
SANDBOX_BASE_URL=${base}
MARKETS_KEY=${ref('markets')}
BETS_KEY=${ref('bets')}
PROMOTIONS_KEY=${ref('promotions')}
WALLET_KEY=${ref('wallet')}
PLAYER_LIMITS_KEY=${ref('player-limits')}
GEO_KEY=${ref('geo-compliance')}
`);
w('demo/bet-slip/.agent/session-2026-10-05.jsonl', [
  { ts: '2026-10-05T18:02:11Z', role: 'user', content: 'why is the quote endpoint returning 401?' },
  { ts: '2026-10-05T18:02:19Z', role: 'tool', name: 'bash', input: 'cat .env', output: `MARKETS_KEY=${raw('markets')}\nBETS_KEY=${raw('bets')}` },
  { ts: '2026-10-05T18:02:31Z', role: 'assistant', content: `The key is set. Retrying with debug logging: curl -v -H 'Authorization: Bearer ${raw('markets')}' ...` },
].map((l) => JSON.stringify(l)).join('\n') + '\n');
w('demo/agent/.env', `RIDGELINE_BASE_URL=${base}
${['markets', 'wallet', 'promotions', 'player-limits', 'bets', 'geo-compliance'].map((s) => `RIDGELINE_${s.replace(/-/g, '_').toUpperCase()}_KEY=${ref(s)}`).join('\n')}
PASSPORT_PROXY_URL=
ANTHROPIC_API_KEY={{vault:ANTHROPIC_API_KEY}}
RIDGELINE_AGENT_MODEL=anthropic/claude-sonnet-4-5
`);
