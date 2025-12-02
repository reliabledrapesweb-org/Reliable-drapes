/**
 * Integration tests for authentication server actions.
 */

import { describe, expect, test, beforeEach, vi } from 'vitest';
import { signupAction, loginAction } from './auth';

// Mock Supabase clients since these are integration tests that would touch a real DB
vi.mock('@/lib/supabase/admin');
vi.mock('@/lib/supabase/anon');

import { getAdminSupabase } from '@/lib/supabase/admin';
import { getAnonSupabase } from '@/lib/supabase/anon';

const mockGetAdminSupabase = getAdminSupabase as ReturnType<typeof vi.fn>;
const mockGetAnonSupabase = getAnonSupabase as ReturnType<typeof vi.fn>;

describe('signupAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('creates user with valid signup data', async () => {
    const mockAdminClient = {
      auth: {
        admin: {
          createUser: vi.fn(() => Promise.resolve({
            data: { user: { id: 'user-123' } },
            error: null,
          })),
        },
      },
      from: vi.fn(() => ({
        upsert: vi.fn(() => Promise.resolve({ error: null })),
      })),
    } as any;

    mockGetAdminSupabase.mockReturnValue(mockAdminClient);

    const result = await signupAction({
      email: 'test@example.com',
      password: 'SecurePass123',
      full_name: 'Test User',
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBe('user-123');
    expect(mockAdminClient.auth.admin.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SecurePass123',
      user_metadata: { full_name: 'Test User' },
      email_confirm: true,
    });
  });

  test('returns error when user creation fails', async () => {
    const mockAdminClient = {
      auth: {
        admin: {
          createUser: vi.fn(() => Promise.resolve({
            data: null,
            error: { message: 'User already exists' },
          })),
        },
      },
    } as any;

    mockGetAdminSupabase.mockReturnValue(mockAdminClient);

    const result = await signupAction({
      email: 'test@example.com',
      password: 'SecurePass123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to create user');
  });

  test('returns validation error for invalid email', async () => {
    const result = await signupAction({
      email: 'invalid-email',
      password: 'SecurePass123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid signup payload');
  });

  test('returns validation error for short password', async () => {
    const result = await signupAction({
      email: 'test@example.com',
      password: 'short',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid signup payload');
  });

  test('handles profile upsert failure gracefully', async () => {
    const mockAdminClient = {
      auth: {
        admin: {
          createUser: vi.fn(() => Promise.resolve({
            data: { user: { id: 'user-123' } },
            error: null,
          })),
        },
      },
      from: vi.fn(() => ({
        upsert: vi.fn(() => Promise.resolve({
          error: { message: 'Profile upsert failed' },
        })),
      })),
    } as any;

    mockGetAdminSupabase.mockReturnValue(mockAdminClient);

    const result = await signupAction({
      email: 'test@example.com',
      password: 'SecurePass123',
    });

    // Should still return success even if profile upsert fails
    expect(result.success).toBe(true);
    expect(result.userId).toBe('user-123');
  });
});

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('authenticates user with valid credentials', async () => {
    const mockAnonClient = {
      auth: {
        signInWithPassword: vi.fn(() => Promise.resolve({
          data: {
            user: { id: 'user-123', email: 'test@example.com' },
            session: { access_token: 'token-123' },
          },
          error: null,
        })),
      },
    } as any;

    mockGetAnonSupabase.mockReturnValue(mockAnonClient);

    const result = await loginAction({
      email: 'test@example.com',
      password: 'SecurePass123',
    });

    expect(result.success).toBe(true);
    expect(result.user?.id).toBe('user-123');
    expect(result.session?.access_token).toBe('token-123');
    expect(mockAnonClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SecurePass123',
    });
  });

  test('returns error for invalid credentials', async () => {
    const mockAnonClient = {
      auth: {
        signInWithPassword: vi.fn(() => Promise.resolve({
          data: null,
          error: { message: 'Invalid login credentials' },
        })),
      },
    } as any;

    mockGetAnonSupabase.mockReturnValue(mockAnonClient);

    const result = await loginAction({
      email: 'test@example.com',
      password: 'WrongPassword',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Login failed');
  });

  test('returns validation error for invalid email format', async () => {
    const result = await loginAction({
      email: 'not-an-email',
      password: 'Password123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid login payload');
  });

  test('returns validation error for missing password', async () => {
    const result = await loginAction({
      email: 'test@example.com',
      password: '',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid login payload');
  });

  test('accepts FormData as input', async () => {
    const mockAnonClient = {
      auth: {
        signInWithPassword: vi.fn(() => Promise.resolve({
          data: {
            user: { id: 'user-123', email: 'test@example.com' },
            session: { access_token: 'token-123' },
          },
          error: null,
        })),
      },
    } as any;

    mockGetAnonSupabase.mockReturnValue(mockAnonClient);

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'SecurePass123');

    const result = await loginAction(formData);

    expect(result.success).toBe(true);
    expect(mockAnonClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SecurePass123',
    });
  });
});
