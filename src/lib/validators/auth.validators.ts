/**
 * Authentication validation schemas using Zod
 */

import { z } from "zod";

import { indianPhoneSchema } from "./profile.validators";

export const authSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1).optional(),
  phone: indianPhoneSchema,
});

export const authLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const productsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const createOrderSchema = z.object({
  total: z.number().nonnegative("Total must be non-negative"),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid("Invalid product ID"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
        price: z.number().nonnegative().optional(),
      }),
    )
    .optional()
    .default([]),
});

// Type exports
export type AuthSignupInput = z.infer<typeof authSignupSchema>;
export type AuthLoginInput = z.infer<typeof authLoginSchema>;
export type ProductsQueryInput = z.infer<typeof productsQuerySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
