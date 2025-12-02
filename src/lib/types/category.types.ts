/**
 * Category-related type definitions
 */

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
