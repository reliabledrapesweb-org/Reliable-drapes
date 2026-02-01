/**
 * Test suite for catalogue management server actions
 * Tests core functionality with proper mocking
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Create chainable mock methods
function createChainableMock(finalValue: any) {
  const chainable: any = {};
  const methods = ["select", "eq", "single", "update", "delete", "insert"];

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

// Create mock Supabase clients
const mockSupabaseClient = {
  from: vi.fn(),
};

const mockSupabaseAdmin = {
  from: vi.fn(),
};

// Mock Supabase server
vi.mock("@/lib/supabase/server", () => ({
  supabaseServer: vi.fn(() => Promise.resolve(mockSupabaseClient)),
  supabaseAdmin: vi.fn(() => mockSupabaseAdmin),
}));

import {
  getCatalogues,
  getAllCatalogues,
  createCatalogue,
  updateCatalogue,
  deleteCatalogue,
} from "./catalogues";

describe("Catalogue Management Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCatalogues", () => {
    it("should return catalogues successfully", async () => {
      const mockCatalogues = [
        { id: "1", title: "Catalogue 1", is_active: true },
        { id: "2", title: "Catalogue 2", is_active: true },
      ];

      mockSupabaseAdmin.from.mockReturnValue(
        createChainableMock({ data: mockCatalogues, error: null }),
      );

      const result = await getCatalogues();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it("should handle database errors", async () => {
      mockSupabaseAdmin.from.mockReturnValue(
        createChainableMock({ data: null, error: { message: "DB Error" } }),
      );

      const result = await getCatalogues();

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe("getAllCatalogues", () => {
    it("should return all catalogues", async () => {
      const mockCatalogues = [
        { id: "1", title: "Active", is_active: true },
        { id: "2", title: "Inactive", is_active: false },
      ];

      mockSupabaseClient.from.mockReturnValue(
        createChainableMock({ data: mockCatalogues, error: null }),
      );

      const result = await getAllCatalogues();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it("should handle database errors", async () => {
      mockSupabaseClient.from.mockReturnValue(
        createChainableMock({ data: null, error: { message: "DB Error" } }),
      );

      const result = await getAllCatalogues();

      expect(result.success).toBe(false);
    });
  });

  describe("createCatalogue", () => {
    it("should create catalogue successfully", async () => {
      const createdCatalogue = {
        id: "new-id",
        title: "Test",
        category: "Test",
        file_url: "https://example.com/test.pdf",
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: createdCatalogue,
          error: null,
        }),
      });

      const result = await createCatalogue({
        title: "Test",
        category_id: "test-category-id",
        file_url: "https://example.com/test.pdf",
      });

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe("Test");
    });

    it("should handle creation errors", async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Creation failed" },
        }),
      });

      const result = await createCatalogue({
        title: "Test",
        category_id: "test-category-id",
        file_url: "https://example.com/test.pdf",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updateCatalogue", () => {
    it("should update catalogue successfully", async () => {
      const updatedCatalogue = { id: "test-id", title: "Updated" };

      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: updatedCatalogue,
          error: null,
        }),
      });

      const result = await updateCatalogue({ id: "test-id", title: "Updated" });

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe("Updated");
    });

    it("should handle update errors", async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Update failed" },
        }),
      });

      const result = await updateCatalogue({ id: "test-id", title: "Updated" });

      expect(result.success).toBe(false);
    });
  });

  describe("deleteCatalogue", () => {
    it("should delete catalogue successfully", async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const result = await deleteCatalogue("test-id");

      expect(result.success).toBe(true);
    });

    it("should handle delete errors", async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: "Delete failed" } }),
      });

      const result = await deleteCatalogue("test-id");

      expect(result.success).toBe(false);
    });
  });
});
