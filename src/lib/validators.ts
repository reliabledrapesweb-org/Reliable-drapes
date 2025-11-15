import { z } from 'zod';

export const authSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1).optional(),
});

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const productsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const createOrderSchema = z.object({
  total: z.number().nonnegative(),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().min(1),
      price: z.number().nonnegative().optional(),
    })
  ).optional().default([]),
});
