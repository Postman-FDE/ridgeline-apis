import { z } from 'zod';

/**
 * Zod schema for the Selections model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const selections = z.lazy(() => {
  return z.object({
    marketId: z.string(),
    outcomeId: z.string(),
  });
});

/**
 * @typedef {Selections} selections
 * @property {string} marketId - Boost to apply. The player must have claimed it first.
 * @property {string} outcomeId - Boost to apply. The player must have claimed it first.
 */
export type Selections = z.infer<typeof selections>;

/**
 * Zod schema for mapping API responses to the Selections application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const selectionsResponse = z.lazy(() => {
  return z
    .object({
      market_id: z.string(),
      outcome_id: z.string(),
    })
    .transform((data) => ({
      marketId: data['market_id'],
      outcomeId: data['outcome_id'],
    }));
});

/**
 * Zod schema for mapping the Selections application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const selectionsRequest = z.lazy(() => {
  return z
    .object({
      marketId: z.string(),
      outcomeId: z.string(),
    })
    .transform((data) => ({
      market_id: data['marketId'],
      outcome_id: data['outcomeId'],
    }));
});
