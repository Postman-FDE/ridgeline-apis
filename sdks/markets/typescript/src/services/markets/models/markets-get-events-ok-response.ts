import { z } from 'zod';

/**
 * Zod schema for the MarketsGetEventsOkResponse model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const marketsGetEventsOkResponse = z.lazy(() => {
  return z.object({
    events: z.array(z.any()).optional(),
  });
});

/**
 * @typedef {MarketsGetEventsOkResponse} marketsGetEventsOkResponse
 * @property {any[]} events
 */
export type MarketsGetEventsOkResponse = z.infer<typeof marketsGetEventsOkResponse>;

/**
 * Zod schema for mapping API responses to the MarketsGetEventsOkResponse application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const marketsGetEventsOkResponseResponse = z.lazy(() => {
  return z
    .object({
      events: z.array(z.any()).optional(),
    })
    .transform((data) => ({
      events: data['events'],
    }));
});

/**
 * Zod schema for mapping the MarketsGetEventsOkResponse application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const marketsGetEventsOkResponseRequest = z.lazy(() => {
  return z
    .object({
      events: z.array(z.any()).optional(),
    })
    .transform((data) => ({
      events: data['events'],
    }));
});
