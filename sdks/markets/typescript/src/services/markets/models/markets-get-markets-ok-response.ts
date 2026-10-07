import { z } from 'zod';

/**
 * Zod schema for the MarketsGetMarketsOkResponse model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const marketsGetMarketsOkResponse = z.lazy(() => {
  return z.object({
    markets: z.array(z.any()).optional(),
  });
});

/**
 * @typedef {MarketsGetMarketsOkResponse} marketsGetMarketsOkResponse
 * @property {any[]} markets
 */
export type MarketsGetMarketsOkResponse = z.infer<typeof marketsGetMarketsOkResponse>;

/**
 * Zod schema for mapping API responses to the MarketsGetMarketsOkResponse application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const marketsGetMarketsOkResponseResponse = z.lazy(() => {
  return z
    .object({
      markets: z.array(z.any()).optional(),
    })
    .transform((data) => ({
      markets: data['markets'],
    }));
});

/**
 * Zod schema for mapping the MarketsGetMarketsOkResponse application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const marketsGetMarketsOkResponseRequest = z.lazy(() => {
  return z
    .object({
      markets: z.array(z.any()).optional(),
    })
    .transform((data) => ({
      markets: data['markets'],
    }));
});
