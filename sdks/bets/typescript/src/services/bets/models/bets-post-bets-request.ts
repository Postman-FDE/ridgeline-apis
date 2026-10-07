import { z } from 'zod';
import {
  BetsPostBetsRequestProduct,
  betsPostBetsRequestProduct,
} from './bets-post-bets-request-product';
import { Selections, selections, selectionsRequest, selectionsResponse } from './selections';

/**
 * Zod schema for the BetsPostBetsRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const betsPostBetsRequest = z.lazy(() => {
  return z.object({
    playerId: z.string(),
    product: betsPostBetsRequestProduct.optional(),
    selections: z.array(selections).min(1),
    stakeMinor: z.number().gte(1),
    boostId: z.string().optional(),
  });
});

/**
 * @typedef {BetsPostBetsRequest} betsPostBetsRequest
 * @property {string} playerId - Boost to apply. The player must have claimed it first.
 * @property {BetsPostBetsRequestProduct} product - `sportsbook` or `casino`.
 * @property {Selections[]} selections - One or more `{ market_id, outcome_id }`. More than one makes a parlay (odds multiply).
 * @property {number} stakeMinor - Stake in minor units (cents). Integer, at least 1. `1000` = $10.00. Replaces the v1 `stake` field.
 * @property {string} boostId - Boost to apply. The player must have claimed it first.
 */
export type BetsPostBetsRequest = z.infer<typeof betsPostBetsRequest>;

/**
 * Zod schema for mapping API responses to the BetsPostBetsRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const betsPostBetsRequestResponse = z.lazy(() => {
  return z
    .object({
      player_id: z.string(),
      product: betsPostBetsRequestProduct.optional(),
      selections: z.array(selectionsResponse).min(1),
      stake_minor: z.number().gte(1),
      boost_id: z.string().optional(),
    })
    .transform((data) => ({
      playerId: data['player_id'],
      product: data['product'],
      selections: data['selections'],
      stakeMinor: data['stake_minor'],
      boostId: data['boost_id'],
    }));
});

/**
 * Zod schema for mapping the BetsPostBetsRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const betsPostBetsRequestRequest = z.lazy(() => {
  return z
    .object({
      playerId: z.string(),
      product: betsPostBetsRequestProduct.optional(),
      selections: z.array(selectionsRequest).min(1),
      stakeMinor: z.number().gte(1),
      boostId: z.string().optional(),
    })
    .transform((data) => ({
      player_id: data['playerId'],
      product: data['product'],
      selections: data['selections'],
      stake_minor: data['stakeMinor'],
      boost_id: data['boostId'],
    }));
});
