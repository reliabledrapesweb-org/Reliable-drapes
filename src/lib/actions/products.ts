/**
 * Server actions for product management
 */

"use server";

import { getAnonSupabase } from "@/lib/supabase/anon";
import { getAdminSupabase } from "@/lib/supabase/admin";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  created_at: string;
}

export interface ProductWithDetails extends Product {
  categories?: Category[];
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductSpecification {
  id: string;
  spec_name: string;
  spec_value: string;
  spec_category: string | null;
}

export interface ProductVariant {
  id: string;
  sku: string | null;
  name: string;
  variant_type: string;
  variant_value: string;
  price_adjustment: number;
  stock_quantity: number;
  is_available: boolean;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "newest" | "price-low" | "price-high" | "popularity";
  limit?: number;
  offset?: number;
}

interface ProductsResponse {
  success: boolean;
  data?: Product[];
  total?: number;
  error?: string;
}

interface ProductResponse {
  success: boolean;
  data?: ProductWithDetails;
  error?: string;
}

/**
 * Get all products with optional filters
 */
export async function getProducts(
  filters?: ProductFilters
): Promise<ProductsResponse> {
  try {
    const supabase = getAnonSupabase();
    let query = supabase.from("products").select("*", { count: "exact" });

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case "price-low":
        query = query.order("price", { ascending: true });
        break;
      case "price-high":
        query = query.order("price", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return {
        success: false,
        error: "Failed to fetch products",
      };
    }

    return {
      success: true,
      data: data as Product[],
      total: count || 0,
    };
  } catch (error) {
    console.error("Get products exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get a single product by ID with all details
 */
export async function getProductById(id: string): Promise<ProductResponse> {
  try {
    const supabase = getAnonSupabase();

    // Get product basic info
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (productError || !product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Get product categories
    const { data: categoryData } = await supabase
      .from("product_categories")
      .select(
        `
        categories (
          id,
          name,
          slug
        )
      `
      )
      .eq("product_id", id);

    // Get product images
    const { data: images } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("sort_order");

    // Get product specifications
    const { data: specifications } = await supabase
      .from("product_specifications")
      .select("*")
      .eq("product_id", id)
      .order("sort_order");

    // Get product variants
    const { data: variants } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .eq("is_available", true)
      .order("sort_order");

    const productWithDetails: ProductWithDetails = {
      ...product,
      categories: categoryData?.map((c: any) => c.categories).filter(Boolean),
      images: (images as ProductImage[]) || [],
      specifications: (specifications as ProductSpecification[]) || [],
      variants: (variants as ProductVariant[]) || [],
    };

    return {
      success: true,
      data: productWithDetails,
    };
  } catch (error) {
    console.error("Get product by ID exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<{
  success: boolean;
  data?: Category[];
  error?: string;
}> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("published", true)
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return {
        success: false,
        error: "Failed to fetch categories",
      };
    }

    return {
      success: true,
      data: data as Category[],
    };
  } catch (error) {
    console.error("Get categories exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  categorySlug: string,
  filters?: ProductFilters
): Promise<ProductsResponse> {
  try {
    const supabase = getAnonSupabase();

    // First, get the category ID
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .eq("published", true)
      .single();

    if (categoryError || !category) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    // Get product IDs for this category
    const { data: productCategories, error: pcError } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", category.id);

    if (pcError) {
      return {
        success: false,
        error: "Failed to fetch products for category",
      };
    }

    const productIds = productCategories.map((pc) => pc.product_id);

    if (productIds.length === 0) {
      return {
        success: true,
        data: [],
        total: 0,
      };
    }

    // Now get the products
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .in("id", productIds);

    // Apply additional filters
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case "price-low":
        query = query.order("price", { ascending: true });
        break;
      case "price-high":
        query = query.order("price", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching category products:", error);
      return {
        success: false,
        error: "Failed to fetch products",
      };
    }

    return {
      success: true,
      data: data as Product[],
      total: count || 0,
    };
  } catch (error) {
    console.error("Get products by category exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Create a new product (Admin only)
 */
export async function createProduct(
  productData: Omit<Product, "id" | "created_at">
): Promise<ProductResponse> {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: productData.name,
          description: productData.description,
          image_url: productData.image_url,
          price: productData.price,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      return {
        success: false,
        error: "Failed to create product",
      };
    }

    return {
      success: true,
      data: data as ProductWithDetails,
    };
  } catch (error) {
    console.error("Create product exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Update an existing product (Admin only)
 */
export async function updateProduct(
  id: string,
  productData: Partial<Omit<Product, "id" | "created_at">>
): Promise<ProductResponse> {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("products")
      .update({
        ...(productData.name && { name: productData.name }),
        ...(productData.description !== undefined && {
          description: productData.description,
        }),
        ...(productData.image_url !== undefined && {
          image_url: productData.image_url,
        }),
        ...(productData.price && { price: productData.price }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return {
        success: false,
        error: "Failed to update product",
      };
    }

    return {
      success: true,
      data: data as ProductWithDetails,
    };
  } catch (error) {
    console.error("Update product exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Delete a product (Admin only)
 */
export async function deleteProduct(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();

    // Delete related records first (if cascade is not set up)
    await Promise.all([
      supabase.from("product_categories").delete().eq("product_id", id),
      supabase.from("product_images").delete().eq("product_id", id),
      supabase.from("product_specifications").delete().eq("product_id", id),
      supabase.from("product_variants").delete().eq("product_id", id),
    ]);

    // Delete the product
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      return {
        success: false,
        error: "Failed to delete product",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete product exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
