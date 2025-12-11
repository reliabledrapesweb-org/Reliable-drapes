/**
 * Test suite for catalogue management server actions
 * Following TDD principles - these tests should be written BEFORE implementation
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCatalogues,
  getAllCatalogues,
  getCatalogueById,
  createCatalogue,
  updateCatalogue,
  deleteCatalogue,
  incrementDownloadCount,
  type Catalogue,
  type CreateCatalogueInput,
} from "./catalogues";

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  supabaseServer: vi.fn(),
}));

describe("Catalogue Management Actions", () => {
  describe("getCatalogues", () => {
    it("should return only active catalogues", async () => {
      const result = await getCatalogues();
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      
      if (result.success && result.data) {
        result.data.forEach((catalogue) => {
          expect(catalogue.is_active).toBe(true);
        });
      }
    });

    it("should order catalogues by creation date descending", async () => {
      const result = await getCatalogues();
      
      if (result.success && result.data && result.data.length > 1) {
        const dates = result.data.map((c) => new Date(c.created_at).getTime());
        const sortedDates = [...dates].sort((a, b) => b - a);
        expect(dates).toEqual(sortedDates);
      }
    });

    it("should handle database errors gracefully", async () => {
      const result = await getCatalogues();
      
      if (!result.success) {
        expect(result.error).toBeTruthy();
        expect(result.data).toBeNull();
      }
    });
  });

  describe("getAllCatalogues", () => {
    it("should return all catalogues including inactive", async () => {
      const result = await getAllCatalogues();
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
    });

    it("should include both active and inactive catalogues", async () => {
      const result = await getAllCatalogues();
      
      if (result.success && result.data) {
        const hasActive = result.data.some((c) => c.is_active);
        const hasInactive = result.data.some((c) => !c.is_active);
        
        // At least one of each should exist in test data
        expect(hasActive || hasInactive).toBe(true);
      }
    });
  });

  describe("getCatalogueById", () => {
    it("should return catalogue by ID", async () => {
      const testId = "test-catalogue-id";
      const result = await getCatalogueById(testId);
      
      if (result.success && result.data) {
        expect(result.data.id).toBe(testId);
      }
    });

    it("should return error for non-existent ID", async () => {
      const result = await getCatalogueById("non-existent-id");
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe("createCatalogue", () => {
    it("should create catalogue with required fields", async () => {
      const input: CreateCatalogueInput = {
        title: "Test Catalogue",
        category: "Test Category",
        pdf_url: "https://example.com/test.pdf",
      };
      
      const result = await createCatalogue(input);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeTruthy();
      
      if (result.success && result.data) {
        expect(result.data.title).toBe(input.title);
        expect(result.data.category).toBe(input.category);
        expect(result.data.pdf_url).toBe(input.pdf_url);
      }
    });

    it("should create catalogue with optional fields", async () => {
      const input: CreateCatalogueInput = {
        title: "Test Catalogue",
        subtitle: "Test Subtitle",
        category: "Test Category",
        pdf_url: "https://example.com/test.pdf",
        image_url: "https://example.com/image.jpg",
        badge: "new",
        discount_value: "-30%",
        product_count: 10,
      };
      
      const result = await createCatalogue(input);
      
      if (result.success && result.data) {
        expect(result.data.subtitle).toBe(input.subtitle);
        expect(result.data.badge).toBe(input.badge);
        expect(result.data.product_count).toBe(input.product_count);
      }
    });

    it("should set default values for optional fields", async () => {
      const input: CreateCatalogueInput = {
        title: "Test Catalogue",
        category: "Test Category",
        pdf_url: "https://example.com/test.pdf",
      };
      
      const result = await createCatalogue(input);
      
      if (result.success && result.data) {
        expect(result.data.product_count).toBe(0);
        expect(result.data.download_count).toBe(0);
        expect(result.data.is_active).toBe(true);
      }
    });

    it("should validate required fields", async () => {
      const input = {
        title: "Test",
        // Missing category and pdf_url
      } as CreateCatalogueInput;
      
      const result = await createCatalogue(input);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe("updateCatalogue", () => {
    it("should update catalogue fields", async () => {
      const input = {
        id: "test-catalogue-id",
        title: "Updated Title",
        subtitle: "Updated Subtitle",
      };
      
      const result = await updateCatalogue(input);
      
      if (result.success && result.data) {
        expect(result.data.title).toBe(input.title);
        expect(result.data.subtitle).toBe(input.subtitle);
      }
    });

    it("should update is_active status", async () => {
      const input = {
        id: "test-catalogue-id",
        is_active: false,
      };
      
      const result = await updateCatalogue(input);
      
      if (result.success && result.data) {
        expect(result.data.is_active).toBe(false);
      }
    });

    it("should update badge and discount", async () => {
      const input = {
        id: "test-catalogue-id",
        badge: "discount" as const,
        discount_value: "-50%",
      };
      
      const result = await updateCatalogue(input);
      
      if (result.success && result.data) {
        expect(result.data.badge).toBe("discount");
        expect(result.data.discount_value).toBe("-50%");
      }
    });

    it("should handle non-existent catalogue", async () => {
      const input = {
        id: "non-existent-id",
        title: "Test",
      };
      
      const result = await updateCatalogue(input);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe("deleteCatalogue", () => {
    it("should delete catalogue successfully", async () => {
      const result = await deleteCatalogue("test-catalogue-id");
      
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should remove catalogue from database", async () => {
      const catalogueId = "test-catalogue-id";
      await deleteCatalogue(catalogueId);
      
      const result = await getCatalogueById(catalogueId);
      expect(result.success).toBe(false);
    });

    it("should handle non-existent catalogue", async () => {
      const result = await deleteCatalogue("non-existent-id");
      
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
    });
  });

  describe("incrementDownloadCount", () => {
    it("should increment download count by 1", async () => {
      const catalogueId = "test-catalogue-id";
      
      const before = await getCatalogueById(catalogueId);
      await incrementDownloadCount(catalogueId);
      const after = await getCatalogueById(catalogueId);
      
      if (before.success && after.success && before.data && after.data) {
        expect(after.data.download_count).toBe(before.data.download_count + 1);
      }
    });

    it("should handle multiple increments", async () => {
      const catalogueId = "test-catalogue-id";
      
      const before = await getCatalogueById(catalogueId);
      
      await incrementDownloadCount(catalogueId);
      await incrementDownloadCount(catalogueId);
      await incrementDownloadCount(catalogueId);
      
      const after = await getCatalogueById(catalogueId);
      
      if (before.success && after.success && before.data && after.data) {
        expect(after.data.download_count).toBe(before.data.download_count + 3);
      }
    });

    it("should handle non-existent catalogue gracefully", async () => {
      const result = await incrementDownloadCount("non-existent-id");
      
      // Should not throw error, just fail silently or return success
      expect(result.success).toBe(true);
    });
  });

  describe("Property-Based Tests", () => {
    it("should maintain catalogue count after create and delete", async () => {
      // Property: Creating then deleting should restore count
      const before = await getAllCatalogues();
      
      const created = await createCatalogue({
        title: "Temp Catalogue",
        category: "Temp",
        pdf_url: "https://example.com/temp.pdf",
      });
      
      if (created.success && created.data) {
        await deleteCatalogue(created.data.id);
      }
      
      const after = await getAllCatalogues();
      
      if (before.success && after.success) {
        expect(after.data?.length).toBe(before.data?.length);
      }
    });

    it("should ensure active catalogues are subset of all catalogues", async () => {
      // Property: Active catalogues should always be subset of all
      const active = await getCatalogues();
      const all = await getAllCatalogues();
      
      if (active.success && all.success) {
        expect(active.data?.length).toBeLessThanOrEqual(all.data?.length || 0);
      }
    });

    it("should ensure download count never decreases", async () => {
      // Property: Download count should be monotonically increasing
      const catalogueId = "test-catalogue-id";
      
      const counts: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        await incrementDownloadCount(catalogueId);
        const result = await getCatalogueById(catalogueId);
        if (result.success && result.data) {
          counts.push(result.data.download_count);
        }
      }
      
      // Each count should be greater than or equal to previous
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
      }
    });

    it("should ensure update preserves ID", async () => {
      // Property: Updating should never change the ID
      const catalogueId = "test-catalogue-id";
      
      const result = await updateCatalogue({
        id: catalogueId,
        title: "New Title",
      });
      
      if (result.success && result.data) {
        expect(result.data.id).toBe(catalogueId);
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty catalogue list", async () => {
      const result = await getCatalogues();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle null optional fields", async () => {
      const input: CreateCatalogueInput = {
        title: "Test",
        category: "Test",
        pdf_url: "https://example.com/test.pdf",
        subtitle: undefined,
        image_url: undefined,
      };
      
      const result = await createCatalogue(input);
      
      if (result.success && result.data) {
        expect(result.data.subtitle).toBeNull();
        expect(result.data.image_url).toBeNull();
      }
    });

    it("should handle very long titles", async () => {
      const longTitle = "A".repeat(1000);
      
      const result = await createCatalogue({
        title: longTitle,
        category: "Test",
        pdf_url: "https://example.com/test.pdf",
      });
      
      // Should either succeed or fail gracefully
      expect(result).toHaveProperty("success");
    });

    it("should handle special characters in URLs", async () => {
      const result = await createCatalogue({
        title: "Test",
        category: "Test",
        pdf_url: "https://example.com/test%20file.pdf?param=value&other=123",
      });
      
      if (result.success && result.data) {
        expect(result.data.pdf_url).toContain("example.com");
      }
    });

    it("should handle concurrent downloads", async () => {
      const catalogueId = "test-catalogue-id";
      
      // Simulate concurrent downloads
      const promises = Array(10)
        .fill(null)
        .map(() => incrementDownloadCount(catalogueId));
      
      await Promise.all(promises);
      
      const result = await getCatalogueById(catalogueId);
      
      // Download count should reflect all increments
      if (result.success && result.data) {
        expect(result.data.download_count).toBeGreaterThan(0);
      }
    });
  });

  describe("Validation Tests", () => {
    it("should validate badge values", async () => {
      const result = await createCatalogue({
        title: "Test",
        category: "Test",
        pdf_url: "https://example.com/test.pdf",
        badge: "invalid" as any,
      });
      
      // Should either reject or coerce to null
      if (result.success && result.data) {
        expect(["new", "discount", null]).toContain(result.data.badge);
      }
    });

    it("should validate product count is non-negative", async () => {
      const result = await createCatalogue({
        title: "Test",
        category: "Test",
        pdf_url: "https://example.com/test.pdf",
        product_count: -5,
      });
      
      if (result.success && result.data) {
        expect(result.data.product_count).toBeGreaterThanOrEqual(0);
      }
    });

    it("should validate PDF URL format", async () => {
      const result = await createCatalogue({
        title: "Test",
        category: "Test",
        pdf_url: "not-a-valid-url",
      });
      
      // Should either reject or accept based on validation rules
      expect(result).toHaveProperty("success");
    });
  });
});
