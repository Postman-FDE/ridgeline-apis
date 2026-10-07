import { z } from 'zod';

export const status = z.literal('accepted');

export type Status = z.infer<typeof status>;
