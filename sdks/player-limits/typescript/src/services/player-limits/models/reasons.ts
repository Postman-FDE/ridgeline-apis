import { z } from 'zod';

export const reasons = z.union([
  z.literal('SELF_EXCLUDED'),
  z.literal('COOL_OFF'),
  z.literal('DAILY_WAGER_LIMIT'),
]);

export type Reasons = z.infer<typeof reasons>;
