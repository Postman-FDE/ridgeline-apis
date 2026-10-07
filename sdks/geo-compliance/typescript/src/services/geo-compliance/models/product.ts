import { z } from 'zod';

export const product = z.union([z.literal('sportsbook'), z.literal('casino')]);

export type Product = z.infer<typeof product>;
