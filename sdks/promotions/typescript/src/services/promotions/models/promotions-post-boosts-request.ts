import { z } from 'zod';
import { Products, products } from './products';

/**
 * Zod schema for the PromotionsPostBoostsRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const promotionsPostBoostsRequest = z.lazy(() => {
  return z.object({
    name: z.string(),
    marketId: z.string(),
    profitBoostPct: z.number(),
    rewardsBackPct: z.number(),
    products: z.array(products),
  });
});

/**
 * @typedef {PromotionsPostBoostsRequest} promotionsPostBoostsRequest
 * @property {string} name - Display name.
 * @property {string} marketId - Market ID from the markets API, e.g. `MKT-ML-001`.
 * @property {number} profitBoostPct - Extra profit on a winning boosted bet, as a whole-number percent (25 = +25% profit).
 * @property {number} rewardsBackPct - Share of the stake credited as rewards, as a whole-number percent (10 = 10% of stake).
 * @property {Products[]} products - Products the boost applies to.
 */
export type PromotionsPostBoostsRequest = z.infer<typeof promotionsPostBoostsRequest>;

/**
 * Zod schema for mapping API responses to the PromotionsPostBoostsRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const promotionsPostBoostsRequestResponse = z.lazy(() => {
  return z
    .object({
      name: z.string(),
      market_id: z.string(),
      profit_boost_pct: z.number(),
      rewards_back_pct: z.number(),
      products: z.array(products),
    })
    .transform((data) => ({
      name: data['name'],
      marketId: data['market_id'],
      profitBoostPct: data['profit_boost_pct'],
      rewardsBackPct: data['rewards_back_pct'],
      products: data['products'],
    }));
});

/**
 * Zod schema for mapping the PromotionsPostBoostsRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const promotionsPostBoostsRequestRequest = z.lazy(() => {
  return z
    .object({
      name: z.string(),
      marketId: z.string(),
      profitBoostPct: z.number(),
      rewardsBackPct: z.number(),
      products: z.array(products),
    })
    .transform((data) => ({
      name: data['name'],
      market_id: data['marketId'],
      profit_boost_pct: data['profitBoostPct'],
      rewards_back_pct: data['rewardsBackPct'],
      products: data['products'],
    }));
});
