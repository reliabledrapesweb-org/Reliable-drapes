/**
 * Test suite for user management server actions
 * Tests core authentication and authorization patterns
 */

import { describe, it, expect, test, beforeEach, vi } from "vitest";

// Mock next/cache first
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Create chainable mock methods
function createChainableMock(finalValue: any) {
  const chainable: any = {};
  const methods = [
    "select",
    "eq",
    "single",
    "ilike",
    "or",
    "update",
    "delete",
    "insert",
  ];

  methods.forEach((method) => {
    chainable[method] = vi.fn().mockImplementation(() => {
      if (method === "single") {
        return Promise.resolve(finalValue);
      }
      return chainable;
    });
  });

  chainable.order = vi.fn().mockResolvedValue(finalValue);

  return chainable;
}

// Create a mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

// Mock Supabase server
vi.mock("@/lib/supabase/server", () => ({
  supabaseServer: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

// Now import the functions
import {
  getAllUsers,
  updateUser,
  deleteUser,
  promoteToAdmin,
  demoteFromAdmin,
  searchUsers,
  shouldShowPhonePrompt,
} from "./users";

describe("User Management Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("should return error when not authenticated", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const result = await getAllUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentication required");
    });

    it("should return error when user is not admin", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-id" } },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue(
        createChainableMock({ data: { role: "customer" }, error: null }),
      );

      const result = await getAllUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Admin privileges required");
    });
  });

  describe("updateUser", () => {
    it("should return error when not authenticated", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const result = await updateUser({ id: "test-id", full_name: "Test" });

      expect(result.success).toBe(false);
    });
  });

  describe("deleteUser", () => {
    it("should return error when not authenticated", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const result = await deleteUser("test-id");

      expect(result.success).toBe(false);
    });
  });

  describe("promoteToAdmin", () => {
    it("should return error when not authenticated", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const result = await promoteToAdmin("test-id");

      expect(result.success).toBe(false);
    });
  });

  describe("demoteFromAdmin", () => {
    it("should return error when not authenticated", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const result = await demoteFromAdmin("test-id");

      expect(result.success).toBe(false);
    });
  });

  describe("searchUsers", () => {
    it("should search users successfully", async () => {
      const mockResults = [
        { id: "user-1", full_name: "Test User", role: "customer" },
      ];

      mockSupabaseClient.from.mockReturnValue(
        createChainableMock({ data: mockResults, error: null }),
      );

      const result = await searchUsers("Test");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it("should handle errors gracefully", async () => {
      mockSupabaseClient.from.mockReturnValue(
        createChainableMock({
          data: null,
          error: { message: "Search failed" },
        }),
      );

      const result = await searchUsers("Test");

      expect(result.success).toBe(false);
    });
  });
});

describe("shouldShowPhonePrompt", () => {
  test("returns needsPhone=false when phone exists", async () => {
    const result = await shouldShowPhonePrompt("9876543210", 0);
    expect(result).toEqual({ needsPhone: false, canDismiss: true });
  });

  test("returns needsPhone=true, canDismiss=true when phone is null and count < 3", async () => {
    expect(await shouldShowPhonePrompt(null, 0)).toEqual({
      needsPhone: true,
      canDismiss: true,
    });
    expect(await shouldShowPhonePrompt(null, 2)).toEqual({
      needsPhone: true,
      canDismiss: true,
    });
  });

  test("returns needsPhone=true, canDismiss=false when phone is null and count >= 3", async () => {
    expect(await shouldShowPhonePrompt(null, 3)).toEqual({
      needsPhone: true,
      canDismiss: false,
    });
    expect(await shouldShowPhonePrompt(null, 10)).toEqual({
      needsPhone: true,
      canDismiss: false,
    });
  });

  test("treats empty string phone as missing", async () => {
    expect(await shouldShowPhonePrompt("", 0)).toEqual({
      needsPhone: true,
      canDismiss: true,
    });
    expect(await shouldShowPhonePrompt("  ", 1)).toEqual({
      needsPhone: true,
      canDismiss: true,
    });
  });
});
