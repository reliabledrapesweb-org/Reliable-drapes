import { describe, expect, test } from 'vitest';
import {
  authSignupSchema,
  authLoginSchema,
  productsQuerySchema,
  createOrderSchema,
} from './auth.validators';

describe('authSignupSchema', () => {
  test('validates correct signup data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'SecurePass123',
      full_name: 'John Doe',
    };
    const result = authSignupSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.full_name).toBe('John Doe');
    }
  });

  test('validates signup without full_name (optional field)', () => {
    const validData = {
      email: 'user@example.com',
      password: 'SecurePass123',
    };
    const result = authSignupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test('rejects invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'SecurePass123',
    };
    const result = authSignupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test('rejects password shorter than 8 characters', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'Short1',
    };
    const result = authSignupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test('rejects missing email', () => {
    const invalidData = {
      password: 'SecurePass123',
    };
    const result = authSignupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test('rejects missing password', () => {
    const invalidData = {
      email: 'user@example.com',
    };
    const result = authSignupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('authLoginSchema', () => {
  test('validates correct login data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'MyPassword',
    };
    const result = authLoginSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
    }
  });

  test('rejects invalid email format', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password',
    };
    const result = authLoginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test('rejects empty password', () => {
    const invalidData = {
      email: 'user@example.com',
      password: '',
    };
    const result = authLoginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test('rejects missing fields', () => {
    const incompleteData = {
      email: 'user@example.com',
    };
    const result = authLoginSchema.safeParse(incompleteData);
    expect(result.success).toBe(false);
  });
});

describe('productsQuerySchema', () => {
  test('applies default values for empty object', () => {
    const result = productsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.perPage).toBe(20);
    }
  });

  test('coerces string numbers to integers', () => {
    const result = productsQuerySchema.safeParse({
      page: '3',
      perPage: '50',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.perPage).toBe(50);
      expect(typeof result.data.page).toBe('number');
    }
  });

  test('accepts valid numeric values', () => {
    const result = productsQuerySchema.safeParse({
      page: 2,
      perPage: 25,
    });
    expect(result.success).toBe(true);
  });

  test('rejects page less than 1', () => {
    const result = productsQuerySchema.safeParse({
      page: 0,
    });
    expect(result.success).toBe(false);
  });

  test('rejects perPage greater than 100', () => {
    const result = productsQuerySchema.safeParse({
      perPage: 150,
    });
    expect(result.success).toBe(false);
  });

  test('rejects non-integer values', () => {
    const result = productsQuerySchema.safeParse({
      page: 1.5,
    });
    expect(result.success).toBe(false);
  });
});

describe('createOrderSchema', () => {
  test('validates complete order data', () => {
    const validOrder = {
      total: 150.5,
      items: [
        {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 2,
          price: 75.25,
        },
      ],
    };
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  test('validates order with default empty items array', () => {
    const orderWithDefaults = {
      total: 100,
    };
    const result = createOrderSchema.safeParse(orderWithDefaults);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toEqual([]);
    }
  });

  test('rejects negative total', () => {
    const invalidOrder = {
      total: -100,
      items: [],
    };
    const result = createOrderSchema.safeParse(invalidOrder);
    expect(result.success).toBe(false);
  });

  test('rejects invalid UUID format for product_id', () => {
    const invalidOrder = {
      total: 100,
      items: [
        {
          product_id: 'not-a-uuid',
          quantity: 1,
        },
      ],
    };
    const result = createOrderSchema.safeParse(invalidOrder);
    expect(result.success).toBe(false);
  });

  test('rejects zero or negative quantity', () => {
    const invalidOrder = {
      total: 100,
      items: [
        {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 0,
        },
      ],
    };
    const result = createOrderSchema.safeParse(invalidOrder);
    expect(result.success).toBe(false);
  });

  test('rejects non-integer quantity', () => {
    const invalidOrder = {
      total: 100,
      items: [
        {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 1.5,
        },
      ],
    };
    const result = createOrderSchema.safeParse(invalidOrder);
    expect(result.success).toBe(false);
  });

  test('accepts optional price field in items', () => {
    const orderWithPrice = {
      total: 100,
      items: [
        {
          product_id: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 1,
          price: 100,
        },
      ],
    };
    const result = createOrderSchema.safeParse(orderWithPrice);
    expect(result.success).toBe(true);
  });
});
