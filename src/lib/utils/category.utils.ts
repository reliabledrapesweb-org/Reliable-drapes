/**
 * Tree utility functions for product categories
 * Extracted from products.ts to avoid "use server" export restrictions
 */

import type { CategoryId } from "@/lib/types/category.types";
import type { CategoryFull } from "@/lib/actions/products";

// Build a tree structure from flat categories
export function buildCategoryTree(
  categories: CategoryFull[],
  parentId: CategoryId | null = null,
  level = 0,
): CategoryFull[] {
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
  categories: CategoryFull[],
  excludeId?: CategoryId,
): Array<{ id: CategoryId; name: string; level: number }> {
  const result: Array<{ id: CategoryId; name: string; level: number }> = [];

  function traverse(cats: CategoryFull[]) {
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
  categories: CategoryFull[],
  categoryId: CategoryId,
): CategoryId[] {
  const result: CategoryId[] = [categoryId];
  const category = categories.find((c) => c.id === categoryId);

  if (category?.children) {
    for (const child of category.children) {
      result.push(...getDescendantIds(categories, child.id));
    }
  }

  return result;
}
