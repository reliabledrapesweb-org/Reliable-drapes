/**
 * Profile validation schemas using Zod
 */

import { z } from "zod";

export const indianPhoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: indianPhoneSchema.or(z.literal("")).optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  avatar_url: z.string().optional(),
});

// Type exports
export type ProfileFormValues = z.infer<typeof profileSchema>;
