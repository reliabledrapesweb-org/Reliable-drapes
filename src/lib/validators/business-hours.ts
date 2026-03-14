import { z } from "zod";

const businessHoursSchema = z
  .array(
    z.object({
      day: z.string().min(1),
      hours: z.string().min(1),
    }),
  )
  .min(1);

export function validateBusinessHours(
  hours: unknown,
): Array<{ day: string; hours: string }> | null {
  const result = businessHoursSchema.safeParse(hours);
  return result.success ? result.data : null;
}
