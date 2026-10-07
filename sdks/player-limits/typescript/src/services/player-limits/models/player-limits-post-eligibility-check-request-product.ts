import { z } from 'zod';

export const playerLimitsPostEligibilityCheckRequestProduct = z.union([
  z.literal('sportsbook'),
  z.literal('casino'),
]);

export type PlayerLimitsPostEligibilityCheckRequestProduct = z.infer<
  typeof playerLimitsPostEligibilityCheckRequestProduct
>;
