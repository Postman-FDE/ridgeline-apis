import { z } from 'zod';

export const playerLimitsPostEligibilityCheckOkResponseProduct = z.union([
  z.literal('sportsbook'),
  z.literal('casino'),
]);

export type PlayerLimitsPostEligibilityCheckOkResponseProduct = z.infer<
  typeof playerLimitsPostEligibilityCheckOkResponseProduct
>;
