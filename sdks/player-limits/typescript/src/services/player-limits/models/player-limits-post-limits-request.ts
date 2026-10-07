import { z } from 'zod';

/**
 * Zod schema for the PlayerLimitsPostLimitsRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const playerLimitsPostLimitsRequest = z.lazy(() => {
  return z.object({
    playerId: z.string(),
  });
});

/**
 * @typedef {PlayerLimitsPostLimitsRequest} playerLimitsPostLimitsRequest
 * @property {string} playerId - Sandbox player ID, `P-1001` to `P-1005`.
 */
export type PlayerLimitsPostLimitsRequest = z.infer<typeof playerLimitsPostLimitsRequest>;

/**
 * Zod schema for mapping API responses to the PlayerLimitsPostLimitsRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const playerLimitsPostLimitsRequestResponse = z.lazy(() => {
  return z
    .object({
      player_id: z.string(),
    })
    .transform((data) => ({
      playerId: data['player_id'],
    }));
});

/**
 * Zod schema for mapping the PlayerLimitsPostLimitsRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const playerLimitsPostLimitsRequestRequest = z.lazy(() => {
  return z
    .object({
      playerId: z.string(),
    })
    .transform((data) => ({
      player_id: data['playerId'],
    }));
});
