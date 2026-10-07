import { z } from 'zod';
import {
  PlayerLimitsPostEligibilityCheckRequestProduct,
  playerLimitsPostEligibilityCheckRequestProduct,
} from './player-limits-post-eligibility-check-request-product';

/**
 * Zod schema for the PlayerLimitsPostEligibilityCheckRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const playerLimitsPostEligibilityCheckRequest = z.lazy(() => {
  return z.object({
    playerId: z.string(),
    product: playerLimitsPostEligibilityCheckRequestProduct,
    amountMinor: z.number().gte(1).optional(),
  });
});

/**
 * @typedef {PlayerLimitsPostEligibilityCheckRequest} playerLimitsPostEligibilityCheckRequest
 * @property {string} playerId - Sandbox player ID, `P-1001` to `P-1005`.
 * @property {PlayerLimitsPostEligibilityCheckRequestProduct} product - `sportsbook` or `casino`.
 * @property {number} amountMinor - Amount in minor units (cents). Integer, at least 1.
 */
export type PlayerLimitsPostEligibilityCheckRequest = z.infer<
  typeof playerLimitsPostEligibilityCheckRequest
>;

/**
 * Zod schema for mapping API responses to the PlayerLimitsPostEligibilityCheckRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const playerLimitsPostEligibilityCheckRequestResponse = z.lazy(() => {
  return z
    .object({
      player_id: z.string(),
      product: playerLimitsPostEligibilityCheckRequestProduct,
      amount_minor: z.number().gte(1).optional(),
    })
    .transform((data) => ({
      playerId: data['player_id'],
      product: data['product'],
      amountMinor: data['amount_minor'],
    }));
});

/**
 * Zod schema for mapping the PlayerLimitsPostEligibilityCheckRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const playerLimitsPostEligibilityCheckRequestRequest = z.lazy(() => {
  return z
    .object({
      playerId: z.string(),
      product: playerLimitsPostEligibilityCheckRequestProduct,
      amountMinor: z.number().gte(1).optional(),
    })
    .transform((data) => ({
      player_id: data['playerId'],
      product: data['product'],
      amount_minor: data['amountMinor'],
    }));
});
