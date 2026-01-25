/**
 * Integration tests for authentication server actions.
 */

import { describe, expect, test, beforeEach, vi } from "vitest";
import { signupAction, loginAction } from "./auth";

// Mock Supabase clients
vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabase: vi.fn(),
}));

vi.mock("@/lib/supabase/anon", () => ({
  getAnonSupabase: vi.fn(),
}));

// Mock the client module for loginAction
vi.mock("@/lib/supabase/client", () => ({
  supabaseClient: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAnonSupabase } from "@/lib/supabase/anon";
import { supabaseClient } from "@/lib/supabase/client";

const mockGetAdminSupabase = getAdminSupabase as ReturnType<typeof vi.fn>;
const mockGetAnonSupabase = getAnonSupabase as ReturnType<typeof vi.fn>;
const mockSupabaseClient = supabaseClient as {
  auth: { signInWithPassword: ReturnType<typeof vi.fn> };
};

describe("signupAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("creates user with valid signup data", async () => {
    const mockAnonClient = {
      auth: {
        signUp: vi.fn(() =>
          Promise.resolve({
            data: { user: { id: "user-123" } },
            error: null,
          }),
        ),
      },
    } as any;

    const mockAdminClient = {
      from: vi.fn(() => ({
        upsert: vi.fn(() => Promise.resolve({ error: null })),
      })),
    } as any;

    mockGetAnonSupabase.mockReturnValue(mockAnonClient);
    mockGetAdminSupabase.mockReturnValue(mockAdminClient);

    const result = await signupAction({
      email: "test@example.com",
      password: "SecurePass123",
      full_name: "Test User",
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBe("user-123");
  });

  test("returns error when user creation fails", async () => {
    const mockAnonClient = {
      auth: {
        signUp: vi.fn(() =>
          Promise.resolve({
            data: { user: null },
            error: { message: "User already exists" },
          }),
        ),
      },
    } as any;

    const mockAdminClient = {} as any;

    mockGetAnonSupabase.mockReturnValue(mockAnonClient);
    mockGetAdminSupabase.mockReturnValue(mockAdminClient);

    const result = await signupAction({
      email: "test@example.com",
      password: "SecurePass123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("User already exists");
  });

  test("returns validation error for invalid email", async () => {
    const result = await signupAction({
      email: "invalid-email",
      password: "SecurePass123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid signup payload");
  });

  test("returns validation error for short password", async () => {
    const result = await signupAction({
      email: "test@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid signup payload");
  });

  test("handles profile upsert failure gracefully", async () => {
    const mockAnonClient = {
      auth: {
        signUp: vi.fn(() =>
          Promise.resolve({
            data: { user: { id: "user-123" } },
            error: null,
          }),
        ),
      },
    } as any;

    const mockAdminClient = {
      from: vi.fn(() => ({
        upsert: vi.fn(() =>
          Promise.resolve({
            error: { message: "Profile upsert failed" },
          }),
        ),
      })),
    } as any;

    mockGetAnonSupabase.mockReturnValue(mockAnonClient);
    mockGetAdminSupabase.mockReturnValue(mockAdminClient);

    const result = await signupAction({
      email: "test@example.com",
      password: "SecurePass123",
    });

    // Should still return success even if profile upsert fails
    expect(result.success).toBe(true);
    expect(result.userId).toBe("user-123");
  });
});

describe("loginAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("authenticates user with valid credentials", async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: "user-123", email: "test@example.com" },
        session: { access_token: "token-123" },
      },
      error: null,
    });

    const result = await loginAction({
      email: "test@example.com",
      password: "SecurePass123",
    });

    expect(result.success).toBe(true);
    expect(result.user?.id).toBe("user-123");
    expect(result.session?.access_token).toBe("token-123");
  });

  test("returns error for invalid credentials", async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });

    const result = await loginAction({
      email: "test@example.com",
      password: "WrongPassword",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Login failed");
  });

  test("returns validation error for invalid email format", async () => {
    const result = await loginAction({
      email: "not-an-email",
      password: "Password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid login payload");
  });

  test("returns validation error for missing password", async () => {
    const result = await loginAction({
      email: "test@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid login payload");
  });

  test("accepts FormData as input", async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: "user-123", email: "test@example.com" },
        session: { access_token: "token-123" },
      },
      error: null,
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "SecurePass123");

    const result = await loginAction(formData);

    expect(result.success).toBe(true);
  });
});
