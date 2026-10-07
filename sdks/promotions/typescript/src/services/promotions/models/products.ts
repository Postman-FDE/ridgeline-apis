import { z } from 'zod';

export const products = z.union([z.literal('sportsbook'), z.literal('casino')]);

export type Products = z.infer<typeof products>;
