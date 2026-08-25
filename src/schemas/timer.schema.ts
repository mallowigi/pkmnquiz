import { z } from 'zod';

export const timerStateSchema = z.object({
  elapsed: z.number().int().nonnegative(),
  isLimited: z.boolean(),
  minutes: z.number().int().nonnegative(),
  savedAt: z.number().nullable(),
  startTime: z.number().nullable(),
});
