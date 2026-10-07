/**
 * Run boost-ops without Astropods (no messaging sidecar), straight from a laptop shell where
 * `passport setup` has already configured the proxy.
 *   bun agent/local.ts "Launch the Championship Rewards Boost ..."
 */
import { agent } from './agent';

const prompt =
  process.argv.slice(2).join(' ') ||
  'Launch the Championship Rewards Boost on the EVT-FINAL-2026 moneyline: 25% profit boost, 10% rewards back, sportsbook and casino. ' +
    'Offer it to P-1001, P-1002, P-1003, P-1004 and P-1005 where allowed, verify the end state, and give me a table of who got it and who was skipped and why.';

const result = await agent.generate(prompt, { maxSteps: 40 });
for (const step of result.steps ?? []) {
  for (const call of step.toolCalls ?? []) console.error(`tool  ${call.payload?.toolName}`);
}
console.log('\n' + result.text);
