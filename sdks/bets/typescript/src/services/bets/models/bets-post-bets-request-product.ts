import { z } from 'zod';

export const betsPostBetsRequestProduct = z.union([z.literal('sportsbook'), z.literal('casino')]);

export type BetsPostBetsRequestProduct = z.infer<typeof betsPostBetsRequestProduct>;
