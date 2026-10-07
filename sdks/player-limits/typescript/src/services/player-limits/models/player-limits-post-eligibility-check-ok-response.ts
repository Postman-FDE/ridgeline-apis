import { z } from 'zod';
import {
  PlayerLimitsPostEligibilityCheckOkResponseProduct,
  playerLimitsPostEligibilityCheckOkResponseProduct,
} from './player-limits-post-eligibility-check-ok-response-product';
import { Reasons, reasons } from './reasons';

/**
 * Zod schema for the PlayerLimitsPostEligibilityCheckOkResponse model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const playerLimitsPostEligibilityCheckOkResponse = z.lazy(() => {
  return z.object({
    playerId: z.string(),
    product: playerLimitsPostEligibilityCheckOkResponseProduct.optional(),
    eligible: z.boolean(),
    reasons: z.array(reasons),
    mayReceivePromotions: z.boolean(),
    remainingDailyWagerMinor: z.number().optional(),
    checkedAt: z.string().optional(),
  });
});

/**
 * @typedef {PlayerLimitsPostEligibilityCheckOkResponse} playerLimitsPostEligibilityCheckOkResponse
 * @property {string} playerId - Sandbox player ID, `P-1001` to `P-1005`.
 * @property {PlayerLimitsPostEligibilityCheckOkResponseProduct} product - `sportsbook` or `casino`.
 * @property {boolean} eligible - `true` if the player may place this wager now.
 * @property {Reasons[]} reasons - Why the player is blocked: `SELF_EXCLUDED`, `COOL_OFF`, `DAILY_WAGER_LIMIT`. Empty when eligible.
 * @property {boolean} mayReceivePromotions - `false` for self-excluded and cool-off players. Callers must not show, offer or claim any promotion when this is `false`.
 * @property {number} remainingDailyWagerMinor - How much more the player may wager today, in cents.
 * @property {string} checkedAt - When the check ran (ISO 8601).
 */
export type PlayerLimitsPostEligibilityCheckOkResponse = z.infer<
  typeof playerLimitsPostEligibilityCheckOkResponse
>;

/**
 * Zod schema for mapping API responses to the PlayerLimitsPostEligibilityCheckOkResponse application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const playerLimitsPostEligibilityCheckOkResponseResponse = z.lazy(() => {
  return z
    .object({
      player_id: z.string(),
      product: playerLimitsPostEligibilityCheckOkResponseProduct.optional(),
      eligible: z.boolean(),
      reasons: z.array(reasons),
      may_receive_promotions: z.boolean(),
      remaining_daily_wager_minor: z.number().optional(),
      checked_at: z.string().optional(),
    })
    .transform((data) => ({
      playerId: data['player_id'],
      product: data['product'],
      eligible: data['eligible'],
      reasons: data['reasons'],
      mayReceivePromotions: data['may_receive_promotions'],
      remainingDailyWagerMinor: data['remaining_daily_wager_minor'],
      checkedAt: data['checked_at'],
    }));
});

/**
 * Zod schema for mapping the PlayerLimitsPostEligibilityCheckOkResponse application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const playerLimitsPostEligibilityCheckOkResponseRequest = z.lazy(() => {
  return z
    .object({
      playerId: z.string(),
      product: playerLimitsPostEligibilityCheckOkResponseProduct.optional(),
      eligible: z.boolean(),
      reasons: z.array(reasons),
      mayReceivePromotions: z.boolean(),
      remainingDailyWagerMinor: z.number().optional(),
      checkedAt: z.string().optional(),
    })
    .transform((data) => ({
      player_id: data['playerId'],
      product: data['product'],
      eligible: data['eligible'],
      reasons: data['reasons'],
      may_receive_promotions: data['mayReceivePromotions'],
      remaining_daily_wager_minor: data['remainingDailyWagerMinor'],
      checked_at: data['checkedAt'],
    }));
});
