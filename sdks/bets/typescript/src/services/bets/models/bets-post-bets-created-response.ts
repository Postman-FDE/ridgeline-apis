import { z } from 'zod';
import { Status, status } from './status';
import {
  BetsPostBetsCreatedResponseProduct,
  betsPostBetsCreatedResponseProduct,
} from './bets-post-bets-created-response-product';

/**
 * Zod schema for the BetsPostBetsCreatedResponse model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const betsPostBetsCreatedResponse = z.lazy(() => {
  return z.object({
    betId: z.string(),
    playerId: z.string().optional(),
    status: status,
    product: betsPostBetsCreatedResponseProduct.optional(),
    stakeMinor: z.number(),
    potentialPayoutMinor: z.number(),
    boostId: z.string().optional().nullable(),
    rewardsEarnedMinor: z.number(),
    placedAt: z.string().optional(),
  });
});

/**
 * @typedef {BetsPostBetsCreatedResponse} betsPostBetsCreatedResponse
 * @property {string} betId - Sandbox player ID, `P-1001` to `P-1005`.
 * @property {string} playerId - Sandbox player ID, `P-1001` to `P-1005`.
 * @property {Status} status - Lifecycle status.
 * @property {BetsPostBetsCreatedResponseProduct} product - `sportsbook` or `casino`.
 * @property {number} stakeMinor - Stake in minor units (cents). Integer, at least 1. `1000` = $10.00. Replaces the v1 `stake` field.
 * @property {number} potentialPayoutMinor - Total return if the bet wins (stake + profit, including any boost), in cents.
 * @property {string} boostId - Boost to apply. The player must have claimed it first.
 * @property {number} rewardsEarnedMinor - Rewards credited by this bet (from the boost), in cents.
 * @property {string} placedAt - When the bet was accepted (ISO 8601).
 */
export type BetsPostBetsCreatedResponse = z.infer<typeof betsPostBetsCreatedResponse>;

/**
 * Zod schema for mapping API responses to the BetsPostBetsCreatedResponse application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const betsPostBetsCreatedResponseResponse = z.lazy(() => {
  return z
    .object({
      bet_id: z.string(),
      player_id: z.string().optional(),
      status: status,
      product: betsPostBetsCreatedResponseProduct.optional(),
      stake_minor: z.number(),
      potential_payout_minor: z.number(),
      boost_id: z.string().optional().nullable(),
      rewards_earned_minor: z.number(),
      placed_at: z.string().optional(),
    })
    .transform((data) => ({
      betId: data['bet_id'],
      playerId: data['player_id'],
      status: data['status'],
      product: data['product'],
      stakeMinor: data['stake_minor'],
      potentialPayoutMinor: data['potential_payout_minor'],
      boostId: data['boost_id'],
      rewardsEarnedMinor: data['rewards_earned_minor'],
      placedAt: data['placed_at'],
    }));
});

/**
 * Zod schema for mapping the BetsPostBetsCreatedResponse application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const betsPostBetsCreatedResponseRequest = z.lazy(() => {
  return z
    .object({
      betId: z.string(),
      playerId: z.string().optional(),
      status: status,
      product: betsPostBetsCreatedResponseProduct.optional(),
      stakeMinor: z.number(),
      potentialPayoutMinor: z.number(),
      boostId: z.string().optional().nullable(),
      rewardsEarnedMinor: z.number(),
      placedAt: z.string().optional(),
    })
    .transform((data) => ({
      bet_id: data['betId'],
      player_id: data['playerId'],
      status: data['status'],
      product: data['product'],
      stake_minor: data['stakeMinor'],
      potential_payout_minor: data['potentialPayoutMinor'],
      boost_id: data['boostId'],
      rewards_earned_minor: data['rewardsEarnedMinor'],
      placed_at: data['placedAt'],
    }));
});
