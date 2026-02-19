import { describe, expect, test } from "vitest";
import type { CatalogueCategoryId } from "@/lib/types/category.types";
import { type CatalogueCategory } from "./catalogue-categories";
import {
  buildCategoryTree,
  flattenCategoryTree,
  getDescendantIds,
} from "@/lib/utils/catalogue-category.utils";

// Helper to create branded IDs in tests
const cid = (value: string): CatalogueCategoryId =>
  value as CatalogueCategoryId;

describe("buildCategoryTree", () => {
  const baseCategory: CatalogueCategory = {
    id: cid("cat-1"),
    name: "Parent",
    slug: "parent",
    description: null,
    image_url: null,
    sort_order: 0,
    is_active: true,
    parent_id: null,
    path: "cat-1",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
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
    const categories: CatalogueCategory[] = [
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
    const categories: CatalogueCategory[] = [
      baseCategory,
      { ...baseCategory, id: cid("cat-2"), name: "Second", slug: "second" },
    ];

    const result = buildCategoryTree(categories);

    expect(result).toHaveLength(2);
  });

  test("handles deeply nested categories (3 levels)", () => {
    const categories: CatalogueCategory[] = [
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
  ): CatalogueCategory => ({
    id: cid(categoryId),
    name,
    slug: name.toLowerCase(),
    description: null,
    image_url: null,
    sort_order: 0,
    is_active: true,
    parent_id: null,
    path: categoryId,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
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
    const tree: CatalogueCategory[] = [
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
  const createCategory = (
    categoryId: string,
    children?: CatalogueCategory[],
  ) => ({
    id: cid(categoryId),
    name: "Category",
    slug: "category",
    description: null,
    image_url: null,
    sort_order: 0,
    is_active: true,
    parent_id: null,
    path: categoryId,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
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
    const categories: CatalogueCategory[] = [cat1, cat2, cat3];

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
