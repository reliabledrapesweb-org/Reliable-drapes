/**
 * Test suite for user management server actions
 * Tests core authentication and authorization patterns
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

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
