/**
 * Product-related type definitions
 */

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  stock?: number;
  featured?: boolean;
  bestseller?: boolean;
  created_at?: string;
}

export interface ProductCard {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  bestseller?: boolean;
}
