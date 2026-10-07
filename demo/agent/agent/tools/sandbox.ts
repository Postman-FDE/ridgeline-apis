import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { SandboxError, sandbox } from '../../src/sandbox-client';

const product = z.enum(['sportsbook', 'casino']);

// Tools return an { error } envelope instead of throwing, so the model can explain what happened
// (for example "access to player-limits was revoked in Passport") rather than crash.
const safe = async <T>(fn: () => Promise<T>) => {
  try {
    return await fn();
  } catch (err) {
    const e = err as SandboxError;
    return { error: e.message, service: e.service, status: e.status, code: e.code };
  }
};

export const listMarketsTool = createTool({
  id: 'listMarkets',
  description: 'List betting markets and odds for an event. The championship event id is EVT-FINAL-2026.',
  inputSchema: z.object({ event_id: z.string().default('EVT-FINAL-2026') }),
  execute: async (input) => safe(() => sandbox.markets(input.event_id)),
});

export const createBoostTool = createTool({
  id: 'createBoost',
  description: 'Create a rewards boost on a market (promotions API). Percentages are whole numbers.',
  inputSchema: z.object({
    name: z.string(),
    market_id: z.string(),
    profit_boost_pct: z.number().int(),
    rewards_back_pct: z.number().int(),
    products: z.array(product).min(1),
  }),
  execute: async (input) => safe(() => sandbox.createBoost(input)),
});

export const checkEligibilityTool = createTool({
  id: 'checkPlayerEligibility',
  description:
    'Ask player-limits (owned by Team Responsible Gaming) whether a player may wager and may receive promotions. ' +
    'This is the only source of truth for self-exclusion, cool-off and wager limits. Never infer eligibility yourself.',
  inputSchema: z.object({ player_id: z.string(), product, amount_minor: z.number().int().positive().optional() }),
  execute: async (input) => safe(() => sandbox.eligibility(input.player_id, input.product, input.amount_minor)),
});

export const checkLocationTool = createTool({
  id: 'checkLocation',
  description: "Ask geo-compliance whether a product is available in the player's state.",
  inputSchema: z.object({ player_id: z.string(), product }),
  execute: async (input) => safe(() => sandbox.location(input.player_id, input.product)),
});

export const claimBoostTool = createTool({
  id: 'claimBoost',
  description:
    'Claim a boost for a player. This tool re-checks player-limits and geo-compliance itself and refuses ' +
    'any player who may not receive promotions or cannot access the product in their state.',
  inputSchema: z.object({ boost_id: z.string(), player_id: z.string(), product }),
  execute: async (input) =>
    safe(async () => {
      // Deterministic guard: the model cannot talk its way past responsible gaming.
      const elig = await sandbox.eligibility(input.player_id, input.product);
      if (!elig.may_receive_promotions) return { claimed: false, player_id: input.player_id, skipped_reason: elig.reasons };
      const geo = await sandbox.location(input.player_id, input.product);
      if (!geo.allowed) return { claimed: false, player_id: input.player_id, skipped_reason: [geo.reason, geo.state] };
      return { claimed: true, claim: await sandbox.claim(input.boost_id, input.player_id) };
    }),
});

export const listClaimsTool = createTool({
  id: 'listClaims',
  description: 'List who holds a claim on a boost. Use it to verify the end state after claiming.',
  inputSchema: z.object({ boost_id: z.string() }),
  execute: async (input) => safe(() => sandbox.claims(input.boost_id)),
});

export const getBalanceTool = createTool({
  id: 'getBalance',
  description: "Get a player's cash, bonus and rewards balance (minor units, cents).",
  inputSchema: z.object({ player_id: z.string() }),
  execute: async (input) => safe(() => sandbox.balance(input.player_id)),
});

export const tools = {
  listMarkets: listMarketsTool,
  createBoost: createBoostTool,
  checkPlayerEligibility: checkEligibilityTool,
  checkLocation: checkLocationTool,
  claimBoost: claimBoostTool,
  listClaims: listClaimsTool,
  getBalance: getBalanceTool,
};
