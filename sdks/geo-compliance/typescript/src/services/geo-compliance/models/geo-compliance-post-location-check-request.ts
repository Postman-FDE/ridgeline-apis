import { z } from 'zod';
import { Product, product } from './product';

/**
 * Zod schema for the GeoCompliancePostLocationCheckRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const geoCompliancePostLocationCheckRequest = z.lazy(() => {
  return z.object({
    playerId: z.string(),
    product: product,
  });
});

/**
 * @typedef {GeoCompliancePostLocationCheckRequest} geoCompliancePostLocationCheckRequest
 * @property {string} playerId - Sandbox player ID, `P-1001` to `P-1005`.
 * @property {Product} product - `sportsbook` or `casino`.
 */
export type GeoCompliancePostLocationCheckRequest = z.infer<
  typeof geoCompliancePostLocationCheckRequest
>;

/**
 * Zod schema for mapping API responses to the GeoCompliancePostLocationCheckRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const geoCompliancePostLocationCheckRequestResponse = z.lazy(() => {
  return z
    .object({
      player_id: z.string(),
      product: product,
    })
    .transform((data) => ({
      playerId: data['player_id'],
      product: data['product'],
    }));
});

/**
 * Zod schema for mapping the GeoCompliancePostLocationCheckRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const geoCompliancePostLocationCheckRequestRequest = z.lazy(() => {
  return z
    .object({
      playerId: z.string(),
      product: product,
    })
    .transform((data) => ({
      player_id: data['playerId'],
      product: data['product'],
    }));
});
