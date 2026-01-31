/**
 * Category-related type definitions
 */

import type { Brand } from "./common.types";

/**
 * Branded type for Product Category IDs
 */
export type CategoryId = Brand<string, "CategoryId">;

/**
 * Branded type for Catalogue Category IDs
 */
export type CatalogueCategoryId = Brand<string, "CatalogueCategoryId">;

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  slug?: string;
  product_count?: number;
}

export interface CategoryWithProducts extends Category {
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image?: string;
  }>;
}
