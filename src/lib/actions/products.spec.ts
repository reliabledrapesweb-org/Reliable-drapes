import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductsByCategory,
} from "./products";

// Helper function to create chainable mock
function createChainableMock(finalValue: any) {
  const chainable: any = {};
  const methods = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "gt",
    "lt",
    "gte",
    "lte",
    "in",
    "is",
    "like",
    "ilike",
    "or",
    "order",
    "limit",
    "range",
    "single",
  ];

  methods.forEach((method) => {
    chainable[method] = vi.fn().mockImplementation(() => {
      if (method === "single") {
        return Promise.resolve(finalValue);
      }
      return chainable;
    });
  });

  // Make the promise resolution happen at the end of the chain if 'single' wasn't called
  chainable.then = (resolve: any) => Promise.resolve(finalValue).then(resolve);

  return chainable;
}

// Mock Supabase clients
const mockAnonClient = {
  from: vi.fn(),
};

const mockAdminClient = {
  from: vi.fn(),
};

vi.mock("@/lib/supabase/anon", () => ({
  getAnonSupabase: () => mockAnonClient,
}));

vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabase: () => mockAdminClient,
}));

describe("Product Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProducts", () => {
    test("fetches all products successfully", async () => {
      const mockData = [{ id: "1", name: "Product 1" }];
      const chainable = createChainableMock({
        data: mockData,
        error: null,
        count: 1,
      });
      mockAnonClient.from.mockReturnValue(chainable);

      const result = await getProducts();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockAnonClient.from).toHaveBeenCalledWith("products");
    });

    test("applies search filter", async () => {
      const chainable = createChainableMock({ data: [], error: null });
      mockAnonClient.from.mockReturnValue(chainable);

      await getProducts({ search: "test" });

      expect(chainable.or).toHaveBeenCalledWith(
        expect.stringContaining("name.ilike.%test%"),
      );
    });

    test("applies price filters", async () => {
      const chainable = createChainableMock({ data: [], error: null });
      mockAnonClient.from.mockReturnValue(chainable);

      await getProducts({ minPrice: 100, maxPrice: 500 });

      expect(chainable.gte).toHaveBeenCalledWith("price", 100);
      expect(chainable.lte).toHaveBeenCalledWith("price", 500);
    });

    test("handles errors gracefully", async () => {
      const chainable = createChainableMock({
        data: null,
        error: { message: "DB Error" },
      });
      mockAnonClient.from.mockReturnValue(chainable);

      const result = await getProducts();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to fetch products");
    });
  });

  describe("getProductById", () => {
    test("fetches product details successfully", async () => {
      const mockProduct = { id: "1", name: "Product 1" };

      // Mock queries for product, categories, images, etc.
      // Since they run sequentially, we can mock them in order
      mockAnonClient.from.mockImplementation((table) => {
        if (table === "products") {
          return createChainableMock({ data: mockProduct, error: null });
        }
        if (table === "product_categories") {
          return createChainableMock({ data: [], error: null });
        }
        if (
          table === "product_images" ||
          table === "product_specifications" ||
          table === "product_variants"
        ) {
          return createChainableMock({ data: [], error: null });
        }
        return createChainableMock({ data: null, error: null });
      });

      const result = await getProductById("1");

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe("1");
      expect(result.data?.images).toEqual([]);
    });

    test("returns error when product not found", async () => {
      mockAnonClient.from.mockImplementation((table) => {
        if (table === "products") {
          return createChainableMock({
            data: null,
            error: { message: "Not found" },
          });
        }
        return createChainableMock({ data: null, error: null });
      });

      const result = await getProductById("999");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Product not found");
    });
  });

  describe("createProduct", () => {
    test("creates product successfully", async () => {
      const newProduct = {
        name: "New Product",
        description: "Desc",
        image_url: "img.jpg",
        price: 100,
        visible_to: ["customer"],
      };

      const createdProduct = {
        id: "1",
        ...newProduct,
        created_at: "2024-01-01",
      };
      const chainable = createChainableMock({
        data: createdProduct,
        error: null,
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await createProduct(newProduct as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdProduct);
      expect(mockAdminClient.from).toHaveBeenCalledWith("products");
      expect(chainable.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "New Product" }),
        ]),
      );
    });

    test("handles creation error", async () => {
      const chainable = createChainableMock({
        data: null,
        error: { message: "Insert failed" },
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await createProduct({} as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create product");
    });
  });

  describe("updateProduct", () => {
    test("updates product successfully", async () => {
      const updates = { name: "Updated Name" };
      const updatedProduct = { id: "1", name: "Updated Name" };

      const chainable = createChainableMock({
        data: updatedProduct,
        error: null,
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await updateProduct("1", updates);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedProduct);
      expect(chainable.update).toHaveBeenCalledWith(
        expect.objectContaining(updates),
      );
      expect(chainable.eq).toHaveBeenCalledWith("id", "1");
    });

    test("handles update error", async () => {
      const chainable = createChainableMock({
        data: null,
        error: { message: "Update failed" },
      });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await updateProduct("1", { name: "Test" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to update product");
    });
  });

  describe("deleteProduct", () => {
    test("deletes product successfully", async () => {
      // Mock deletion of related records first
      const chainable = createChainableMock({ error: null });
      mockAdminClient.from.mockReturnValue(chainable);

      const result = await deleteProduct("1");

      expect(result.success).toBe(true);
      // It should delete related records first, then the product
      expect(mockAdminClient.from).toHaveBeenCalledWith("product_categories");
      expect(mockAdminClient.from).toHaveBeenCalledWith("product_images");
      expect(mockAdminClient.from).toHaveBeenCalledWith("products");
    });

    test("handles deletion error", async () => {
      mockAdminClient.from.mockImplementation((table) => {
        if (table === "products") {
          return createChainableMock({ error: { message: "Delete failed" } });
        }
        return createChainableMock({ error: null });
      });

      const result = await deleteProduct("1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to delete product");
    });
  });

  describe("getCategories", () => {
    test("fetches categories successfully", async () => {
      const mockCategories = [
        { id: "cat-1", name: "Category 1", slug: "cat-1" },
      ];
      const chainable = createChainableMock({
        data: mockCategories,
        error: null,
      });
      mockAnonClient.from.mockReturnValue(chainable);

      const result = await getCategories();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCategories);
    });
  });

  describe("getProductsByCategory", () => {
    test("fetches products by category successfully", async () => {
      // 1. Get category ID
      const mockCategory = { id: "cat-1" };
      // 2. Get product IDs
      const mockProductCategories = [
        { product_id: "p1" },
        { product_id: "p2" },
      ];
      // 3. Get products
      const mockProducts = [{ id: "p1" }, { id: "p2" }];

      mockAnonClient.from.mockImplementation((table) => {
        if (table === "categories") {
          return createChainableMock({ data: mockCategory, error: null });
        }
        if (table === "product_categories") {
          return createChainableMock({
            data: mockProductCategories,
            error: null,
          });
        }
        if (table === "products") {
          return createChainableMock({
            data: mockProducts,
            error: null,
            count: 2,
          });
        }
        return createChainableMock({ data: null, error: null });
      });

      const result = await getProductsByCategory("cat-slug");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProducts);
    });

    test("returns error when category not found", async () => {
      mockAnonClient.from.mockImplementation((table) => {
        if (table === "categories") {
          return createChainableMock({
            data: null,
            error: { message: "Not found" },
          });
        }
        return createChainableMock({ data: null, error: null });
      });

      const result = await getProductsByCategory("invalid-slug");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Category not found");
    });
  });
});
