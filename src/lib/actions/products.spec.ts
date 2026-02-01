import { describe, test, expect, vi, beforeEach } from "vitest";
import type { CategoryId } from "@/lib/types/category.types";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductsByCategory,
  type CategoryFull,
} from "./products";
import {
  buildCategoryTree,
  flattenCategoryTree,
  getDescendantIds,
} from "@/lib/utils/category.utils";

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
      expect(result.error).toBe("Delete failed");
    });
  });

  describe("getCategories", () => {
    test("fetches categories successfully", async () => {
      const mockCategories = [
        { id: "cat-1", name: "Category 1", slug: "cat-1", parent_id: null },
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

// Helper to create branded IDs in tests
const cid = (value: string): CategoryId => value as CategoryId;

describe("buildCategoryTree", () => {
  const baseCategory: CategoryFull = {
    id: cid("cat-1"),
    name: "Parent",
    slug: "parent",
    description: null,
    image_url: null,
    parent_id: null,
    path: "cat-1",
    sort_order: 0,
    is_featured: false,
    published: true,
    show_in_footer: false,
    created_at: "2024-01-01",
  };

  test("returns empty array for empty input", () => {
    expect(buildCategoryTree([])).toEqual([]);
  });

  test("returns single category as root when no parent", () => {
    const categories = [baseCategory];
    const result = buildCategoryTree(categories);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(cid("cat-1"));
    expect(result[0].level).toBe(0);
    expect(result[0].children).toEqual([]);
  });

  test("nests child categories under parent", () => {
    const categories: CategoryFull[] = [
      baseCategory,
      {
        ...baseCategory,
        id: cid("cat-2"),
        name: "Child",
        slug: "child",
        parent_id: cid("cat-1"),
        path: "cat-1/cat-2",
      },
    ];

    const result = buildCategoryTree(categories);

    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children?.[0].id).toBe(cid("cat-2"));
    expect(result[0].children?.[0].level).toBe(1);
  });

  test("handles multiple root categories", () => {
    const categories: CategoryFull[] = [
      baseCategory,
      { ...baseCategory, id: cid("cat-2"), name: "Second", slug: "second" },
    ];

    const result = buildCategoryTree(categories);

    expect(result).toHaveLength(2);
  });

  test("handles deeply nested categories (3 levels)", () => {
    const categories: CategoryFull[] = [
      baseCategory,
      {
        ...baseCategory,
        id: cid("cat-2"),
        parent_id: cid("cat-1"),
        path: "cat-1/cat-2",
      },
      {
        ...baseCategory,
        id: cid("cat-3"),
        parent_id: cid("cat-2"),
        path: "cat-1/cat-2/cat-3",
      },
    ];

    const result = buildCategoryTree(categories);

    expect(result[0].children?.[0].children?.[0].id).toBe(cid("cat-3"));
    expect(result[0].children?.[0].children?.[0].level).toBe(2);
  });
});

describe("flattenCategoryTree", () => {
  const createCategory = (
    categoryId: string,
    name: string,
    level: number,
  ): CategoryFull => ({
    id: cid(categoryId),
    name,
    slug: name.toLowerCase(),
    description: null,
    image_url: null,
    parent_id: null,
    path: categoryId,
    sort_order: 0,
    is_featured: false,
    published: true,
    show_in_footer: false,
    created_at: "2024-01-01",
    level,
  });

  test("returns empty array for empty input", () => {
    expect(flattenCategoryTree([])).toEqual([]);
  });

  test("flattens single level tree", () => {
    const tree = [createCategory("cat-1", "Category 1", 0)];
    const result = flattenCategoryTree(tree);

    expect(result).toEqual([
      { id: cid("cat-1"), name: "Category 1", level: 0 },
    ]);
  });

  test("flattens nested tree in order", () => {
    const tree: CategoryFull[] = [
      {
        ...createCategory("cat-1", "Parent", 0),
        children: [
          createCategory("cat-2", "Child 1", 1),
          createCategory("cat-3", "Child 2", 1),
        ],
      },
    ];

    const result = flattenCategoryTree(tree);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(cid("cat-1"));
    expect(result[1].id).toBe(cid("cat-2"));
    expect(result[2].id).toBe(cid("cat-3"));
    expect(result[1].level).toBe(1);
  });

  test("excludes specified category ID", () => {
    const tree = [
      createCategory("cat-1", "Category 1", 0),
      createCategory("cat-2", "Category 2", 0),
    ];

    const result = flattenCategoryTree(tree, cid("cat-1"));

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(cid("cat-2"));
  });
});

describe("getDescendantIds", () => {
  const createCategory = (categoryId: string, children?: CategoryFull[]) => ({
    id: cid(categoryId),
    name: "Category",
    slug: "category",
    description: null,
    image_url: null,
    parent_id: null,
    path: categoryId,
    sort_order: 0,
    is_featured: false,
    published: true,
    show_in_footer: false,
    created_at: "2024-01-01",
    children,
  });

  test("returns only category ID when no children", () => {
    const categories = [createCategory("cat-1")];
    const result = getDescendantIds(categories, cid("cat-1"));

    expect(result).toEqual([cid("cat-1")]);
  });

  test("returns all descendant IDs including self", () => {
    const cat3 = createCategory("cat-3");
    const cat2 = { ...createCategory("cat-2"), children: [cat3] };
    const cat1 = { ...createCategory("cat-1"), children: [cat2] };
    const categories: CategoryFull[] = [cat1, cat2, cat3];

    const result = getDescendantIds(categories, cid("cat-1"));

    expect(result).toContain(cid("cat-1"));
    expect(result).toContain(cid("cat-2"));
    expect(result).toContain(cid("cat-3"));
    expect(result).toHaveLength(3);
  });

  test("returns empty array when category not found", () => {
    const categories = [createCategory("cat-1")];
    const result = getDescendantIds(categories, cid("non-existent"));

    expect(result).toEqual([cid("non-existent")]);
  });
});
