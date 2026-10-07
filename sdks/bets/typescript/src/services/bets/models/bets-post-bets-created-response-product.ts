import { z } from 'zod';

export const betsPostBetsCreatedResponseProduct = z.union([
  z.literal('sportsbook'),
  z.literal('casino'),
]);

export type BetsPostBetsCreatedResponseProduct = z.infer<typeof betsPostBetsCreatedResponseProduct>;
