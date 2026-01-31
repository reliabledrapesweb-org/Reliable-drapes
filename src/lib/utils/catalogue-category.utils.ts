/**
 * Tree utility functions for catalogue categories
 * Extracted from catalogue-categories.ts to avoid "use server" export restrictions
 */

import type { CatalogueCategoryId } from "@/lib/types/category.types";
import type { CatalogueCategory } from "@/lib/actions/catalogue-categories";

// Build a tree structure from flat categories
export function buildCategoryTree(
  categories: CatalogueCategory[],
  parentId: CatalogueCategoryId | null = null,
  level = 0,
): CatalogueCategory[] {
  return categories
    .filter((cat) => cat.parent_id === parentId)
    .map((cat) => ({
      ...cat,
      level,
      children: buildCategoryTree(categories, cat.id, level + 1),
    }));
}

// Flatten tree to array with indentation for dropdowns
export function flattenCategoryTree(
  categories: CatalogueCategory[],
  excludeId?: CatalogueCategoryId,
): Array<{ id: CatalogueCategoryId; name: string; level: number }> {
  const result: Array<{
    id: CatalogueCategoryId;
    name: string;
    level: number;
  }> = [];

  function traverse(cats: CatalogueCategory[]) {
    for (const cat of cats) {
      if (cat.id !== excludeId) {
        result.push({ id: cat.id, name: cat.name, level: cat.level || 0 });
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children);
        }
      }
    }
  }

  traverse(categories);
  return result;
}

// Get all descendant IDs of a category (including the category itself)
export function getDescendantIds(
  categories: CatalogueCategory[],
  categoryId: CatalogueCategoryId,
): CatalogueCategoryId[] {
  const result: CatalogueCategoryId[] = [categoryId];
  const category = categories.find((c) => c.id === categoryId);

  if (category?.children) {
    for (const child of category.children) {
      result.push(...getDescendantIds(categories, child.id));
    }
  }

  return result;
}
