import { z } from 'zod';

/**
 * Zod schema for the PromotionsPostBoostsClaimRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const promotionsPostBoostsClaimRequest = z.lazy(() => {
  return z.object({
    boostId: z.string(),
    playerId: z.string(),
  });
});

/**
 * @typedef {PromotionsPostBoostsClaimRequest} promotionsPostBoostsClaimRequest
 * @property {string} boostId - Sandbox player ID, `P-1001` to `P-1005`.
 * @property {string} playerId - Sandbox player ID, `P-1001` to `P-1005`.
 */
export type PromotionsPostBoostsClaimRequest = z.infer<typeof promotionsPostBoostsClaimRequest>;

/**
 * Zod schema for mapping API responses to the PromotionsPostBoostsClaimRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const promotionsPostBoostsClaimRequestResponse = z.lazy(() => {
  return z
    .object({
      boost_id: z.string(),
      player_id: z.string(),
    })
    .transform((data) => ({
      boostId: data['boost_id'],
      playerId: data['player_id'],
    }));
});

/**
 * Zod schema for mapping the PromotionsPostBoostsClaimRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const promotionsPostBoostsClaimRequestRequest = z.lazy(() => {
  return z
    .object({
      boostId: z.string(),
      playerId: z.string(),
    })
    .transform((data) => ({
      boost_id: data['boostId'],
      player_id: data['playerId'],
    }));
});
