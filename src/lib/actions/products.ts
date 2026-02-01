/**
 * Server actions for product management
 */

"use server";

import { getAnonSupabase } from "@/lib/supabase/anon";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { CategoryId } from "@/lib/types/category.types";

export interface Product {
  id: string;
  name: string;
  sku: string | null;
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
  parent_id: string | null;
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
  filters?: ProductFilters,
): Promise<ProductsResponse> {
  try {
    const supabase = getAnonSupabase();
    let query = supabase.from("products").select("*", { count: "exact" });

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`,
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
        filters.offset + (filters.limit || 10) - 1,
      );
    }

    const { data, error, count } = await query;

    if (error) {
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
      `,
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
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Check if SKUs already exist in the database
 * Used for pre-import validation
 */
export async function checkSkusExist(skus: string[]): Promise<{
  success: boolean;
  existing: string[];
  error?: string;
}> {
  try {
    if (skus.length === 0) {
      return { success: true, existing: [] };
    }

    const supabase = getAnonSupabase();

    // Filter out empty/null SKUs and normalize to uppercase
    const normalizedSkus = skus
      .filter((sku) => sku && sku.trim())
      .map((sku) => sku.trim().toUpperCase());

    if (normalizedSkus.length === 0) {
      return { success: true, existing: [] };
    }

    const { data, error } = await supabase
      .from("products")
      .select("sku")
      .in("sku", normalizedSkus);

    if (error) {
      return {
        success: false,
        existing: [],
        error: "Failed to check SKUs",
      };
    }

    const existingSkus = (data || [])
      .map((p) => p.sku)
      .filter((sku): sku is string => sku !== null);

    return {
      success: true,
      existing: existingSkus,
    };
  } catch (error) {
    return {
      success: false,
      existing: [],
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
      .select("id, name, slug, parent_id")
      .eq("published", true)
      .order("name");

    if (error) {
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
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get categories for footer (max 4)
 */
export async function getFooterCategories(): Promise<{
  success: boolean;
  data?: Category[];
  error?: string;
}> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .eq("published", true)
      .eq("show_in_footer", true)
      .order("sort_order", { ascending: true })
      .order("name")
      .limit(4);

    if (error) {
      return {
        success: false,
        error: "Failed to fetch footer categories",
      };
    }

    return {
      success: true,
      data: data as Category[],
    };
  } catch (error) {
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
  filters?: ProductFilters,
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
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
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
  productData: Omit<Product, "id" | "created_at">,
): Promise<ProductResponse> {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: productData.name,
          sku: productData.sku || null,
          description: productData.description,
          image_url: productData.image_url,
          price: productData.price,
          visible_to: ["customer"], // Explicitly set to valid role to satisfy constraint
        },
      ])
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation on SKU
      if (error.code === "23505" && error.message.includes("sku")) {
        return {
          success: false,
          error: "A product with this SKU already exists",
        };
      }
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
  productData: Partial<Omit<Product, "id" | "created_at">>,
): Promise<ProductResponse> {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("products")
      .update({
        ...(productData.name && { name: productData.name }),
        ...(productData.sku !== undefined && { sku: productData.sku || null }),
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
      // Check for unique constraint violation on SKU
      if (error.code === "23505" && error.message.includes("sku")) {
        return {
          success: false,
          error: "A product with this SKU already exists",
        };
      }
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

    // 1. Check if product is referenced in any orders
    const { count: orderCount, error: orderCheckError } = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", id);

    if (orderCheckError) {
    }

    if (orderCount && orderCount > 0) {
      return {
        success: false,
        error:
          "This product cannot be deleted because it is part of an existing order. For data integrity, products with order history must be kept. Try unpublishing it instead.",
      };
    }

    // 2. Delete related records that might not have ON DELETE CASCADE or to be safe
    // We do these sequentially to avoid potential race conditions or complex inter-dependencies
    const relatedTables = [
      "product_categories",
      "product_images",
      "product_specifications",
      "product_variants",
      "product_collections",
    ];

    for (const table of relatedTables) {
      const { error: deleteErr } = await supabase
        .from(table)
        .delete()
        .eq("product_id", id);

      if (deleteErr) {
        console.warn(
          `Warning: Failed to delete from ${table}:`,
          deleteErr.message,
        );
        // We continue anyway as the main product delete might still work if cascade is actually set up
      }
    }

    // 3. Delete the main product record
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      if (error.code === "23503") {
        return {
          success: false,
          error:
            "This product is still referenced by other records (e.g. cart, wishlist, or orders) and cannot be deleted.",
        };
      }

      return {
        success: false,
        error: error.message || "Failed to delete product",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred during deletion.",
    };
  }
}

/**
 * Get product-category mappings for multiple products
 */
export async function getProductCategoryMappings(
  productIds: string[],
): Promise<{
  success: boolean;
  data?: Record<string, string[]>;
  error?: string;
}> {
  try {
    if (productIds.length === 0) {
      return { success: true, data: {} };
    }

    const supabase = getAnonSupabase();
    const { data, error } = await supabase
      .from("product_categories")
      .select("product_id, category_id")
      .in("product_id", productIds);

    if (error) {
      return { success: false, error: "Failed to fetch product categories" };
    }

    const mapping: Record<string, string[]> = {};
    (data || []).forEach((pc: { product_id: string; category_id: string }) => {
      if (!mapping[pc.product_id]) {
        mapping[pc.product_id] = [];
      }
      mapping[pc.product_id].push(pc.category_id);
    });

    return { success: true, data: mapping };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================
// Category Management Actions (Admin)
// ============================================

export interface CategoryFull {
  id: CategoryId;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: CategoryId | null;
  path: string;
  sort_order: number;
  is_featured: boolean;
  published: boolean;
  show_in_footer: boolean;
  created_at: string;
  product_count?: number;
  children?: CategoryFull[];
  level?: number;
}

interface CategoryResponse {
  success: boolean;
  data?: CategoryFull;
  error?: string;
}

interface CategoriesResponse {
  success: boolean;
  data?: CategoryFull[];
  error?: string;
}

/**
 * Get all categories with full details (Admin)
 */
export async function getAllCategories(): Promise<CategoriesResponse> {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .order("name");

    if (error) {
      return { success: false, error: "Failed to fetch categories" };
    }

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      (data || []).map(async (category) => {
        const { count } = await supabase
          .from("product_categories")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id);

        return {
          ...category,
          product_count: count || 0,
        };
      }),
    );

    return { success: true, data: categoriesWithCounts as CategoryFull[] };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get featured categories for homepage
 */
export async function getFeaturedCategories(): Promise<CategoriesResponse> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("published", true)
      .eq("is_featured", true)
      .order("sort_order")
      .limit(8);

    if (error) {
      return { success: false, error: "Failed to fetch categories" };
    }

    return { success: true, data: data as CategoryFull[] };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a new category (Admin only)
 */
export async function createCategory(
  categoryData: Omit<
    CategoryFull,
    "id" | "created_at" | "product_count" | "path" | "children" | "level"
  >,
): Promise<CategoryResponse> {
  try {
    const supabase = getAdminSupabase();

    // Generate slug from name if not provided
    const slug =
      categoryData.slug ||
      categoryData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name: categoryData.name,
          slug,
          description: categoryData.description,
          image_url: categoryData.image_url,
          parent_id: categoryData.parent_id,
          sort_order: categoryData.sort_order || 0,
          is_featured: categoryData.is_featured || false,
          published: categoryData.published ?? true,
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to create category",
      };
    }

    // Revalidate pages that show categories
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/categories");

    return { success: true, data: data as CategoryFull };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing category (Admin only)
 */
export async function updateCategory(
  id: string,
  categoryData: Partial<
    Omit<CategoryFull, "id" | "created_at" | "product_count" | "path" | "children" | "level">
  >,
): Promise<CategoryResponse> {
  try {
    const supabase = getAdminSupabase();

    const updateData: Record<string, unknown> = {};
    if (categoryData.name !== undefined) updateData.name = categoryData.name;
    if (categoryData.slug !== undefined) updateData.slug = categoryData.slug;
    if (categoryData.description !== undefined)
      updateData.description = categoryData.description;
    if (categoryData.image_url !== undefined)
      updateData.image_url = categoryData.image_url;
    if (categoryData.parent_id !== undefined)
      updateData.parent_id = categoryData.parent_id;
    if (categoryData.sort_order !== undefined)
      updateData.sort_order = categoryData.sort_order;
    if (categoryData.is_featured !== undefined)
      updateData.is_featured = categoryData.is_featured;
    if (categoryData.published !== undefined)
      updateData.published = categoryData.published;

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to update category",
      };
    }

    // Revalidate pages that show categories
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/categories");

    return { success: true, data: data as CategoryFull };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a category (Admin only)
 */
export async function deleteCategory(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminSupabase();

    // Delete product-category associations first
    await supabase.from("product_categories").delete().eq("category_id", id);

    // Delete the category
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      return { success: false, error: "Failed to delete category" };
    }

    // Revalidate pages that show categories
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/categories");

    return { success: true };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Assign a product to a category
 */
export async function assignProductToCategory(
  productId: string,
  categoryId: string,
  isPrimary: boolean = false,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminSupabase();

    const { error } = await supabase.from("product_categories").upsert(
      {
        product_id: productId,
        category_id: categoryId,
        is_primary: isPrimary,
      },
      { onConflict: "product_id,category_id" },
    );

    if (error) {
      return { success: false, error: "Failed to assign product to category" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Remove a product from a category
 */
export async function removeProductFromCategory(
  productId: string,
  categoryId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminSupabase();

    const { error } = await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", productId)
      .eq("category_id", categoryId);

    if (error) {
      return {
        success: false,
        error: "Failed to remove product from category",
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================
// Collections Management Actions
// ============================================

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  product_count?: number;
}

interface CollectionResponse {
  success: boolean;
  data?: Collection;
  error?: string;
}

interface CollectionsResponse {
  success: boolean;
  data?: Collection[];
  error?: string;
}

/**
 * Get all collections (Admin)
 */
export async function getAllCollections(): Promise<CollectionsResponse> {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("sort_order")
      .order("name");

    if (error) {
      return { success: false, error: "Failed to fetch collections" };
    }

    // Get product counts for each collection
    const collectionsWithCounts = await Promise.all(
      (data || []).map(async (collection) => {
        const { count } = await supabase
          .from("product_collections")
          .select("*", { count: "exact", head: true })
          .eq("collection_id", collection.id);

        return {
          ...collection,
          product_count: count || 0,
        };
      }),
    );

    return { success: true, data: collectionsWithCounts as Collection[] };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get active collections for public display
 */
export async function getActiveCollections(): Promise<CollectionsResponse> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .order("name");

    if (error) {
      return { success: false, error: "Failed to fetch collections" };
    }

    return { success: true, data: data as Collection[] };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get products in a collection
 */
export async function getCollectionProducts(
  collectionSlug: string,
): Promise<ProductsResponse> {
  try {
    const supabase = getAnonSupabase();

    // Get collection
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", collectionSlug)
      .eq("is_active", true)
      .single();

    if (collectionError || !collection) {
      return { success: false, error: "Collection not found" };
    }

    // Get product IDs in this collection
    const { data: productCollections, error: pcError } = await supabase
      .from("product_collections")
      .select("product_id, featured_order")
      .eq("collection_id", collection.id)
      .order("featured_order", { nullsFirst: false });

    if (pcError) {
      return { success: false, error: "Failed to fetch collection products" };
    }

    const productIds = productCollections.map((pc) => pc.product_id);

    if (productIds.length === 0) {
      return { success: true, data: [], total: 0 };
    }

    // Get products
    const { data, error, count } = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .in("id", productIds);

    if (error) {
      return { success: false, error: "Failed to fetch products" };
    }

    // Sort by featured_order
    const sortedData = (data || []).sort((a, b) => {
      const orderA =
        productCollections.find((pc) => pc.product_id === a.id)
          ?.featured_order || 999;
      const orderB =
        productCollections.find((pc) => pc.product_id === b.id)
          ?.featured_order || 999;
      return orderA - orderB;
    });

    return { success: true, data: sortedData as Product[], total: count || 0 };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a collection (Admin only)
 */
export async function createCollection(
  collectionData: Omit<Collection, "id" | "created_at" | "product_count">,
): Promise<CollectionResponse> {
  try {
    const supabase = getAdminSupabase();

    const slug =
      collectionData.slug ||
      collectionData.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const { data, error } = await supabase
      .from("collections")
      .insert([
        {
          name: collectionData.name,
          slug,
          description: collectionData.description,
          image_url: collectionData.image_url,
          banner_url: collectionData.banner_url,
          start_date: collectionData.start_date,
          end_date: collectionData.end_date,
          is_active: collectionData.is_active ?? true,
          sort_order: collectionData.sort_order || 0,
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to create collection",
      };
    }

    return { success: true, data: data as Collection };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update a collection (Admin only)
 */
export async function updateCollection(
  id: string,
  collectionData: Partial<
    Omit<Collection, "id" | "created_at" | "product_count">
  >,
): Promise<CollectionResponse> {
  try {
    const supabase = getAdminSupabase();

    const updateData: Record<string, unknown> = {};
    if (collectionData.name !== undefined)
      updateData.name = collectionData.name;
    if (collectionData.slug !== undefined)
      updateData.slug = collectionData.slug;
    if (collectionData.description !== undefined)
      updateData.description = collectionData.description;
    if (collectionData.image_url !== undefined)
      updateData.image_url = collectionData.image_url;
    if (collectionData.banner_url !== undefined)
      updateData.banner_url = collectionData.banner_url;
    if (collectionData.start_date !== undefined)
      updateData.start_date = collectionData.start_date;
    if (collectionData.end_date !== undefined)
      updateData.end_date = collectionData.end_date;
    if (collectionData.is_active !== undefined)
      updateData.is_active = collectionData.is_active;
    if (collectionData.sort_order !== undefined)
      updateData.sort_order = collectionData.sort_order;

    const { data, error } = await supabase
      .from("collections")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to update collection",
      };
    }

    return { success: true, data: data as Collection };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a collection (Admin only)
 */
export async function deleteCollection(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminSupabase();

    // Delete product-collection associations first
    await supabase.from("product_collections").delete().eq("collection_id", id);

    // Delete the collection
    const { error } = await supabase.from("collections").delete().eq("id", id);

    if (error) {
      return { success: false, error: "Failed to delete collection" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Add product to collection
 */
export async function addProductToCollection(
  productId: string,
  collectionId: string,
  featuredOrder?: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminSupabase();

    const { error } = await supabase.from("product_collections").upsert(
      {
        product_id: productId,
        collection_id: collectionId,
        featured_order: featuredOrder,
      },
      { onConflict: "product_id,collection_id" },
    );

    if (error) {
      return { success: false, error: "Failed to add product to collection" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Remove product from collection
 */
export async function removeProductFromCollection(
  productId: string,
  collectionId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminSupabase();

    const { error } = await supabase
      .from("product_collections")
      .delete()
      .eq("product_id", productId)
      .eq("collection_id", collectionId);

    if (error) {
      return {
        success: false,
        error: "Failed to remove product from collection",
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get product-collection mappings for multiple products
 * Returns mapping of product_id -> collection_id[]
 */
export async function getProductCollectionMappings(
  productIds: string[],
): Promise<{
  success: boolean;
  data?: Record<string, string[]>;
  error?: string;
}> {
  try {
    if (productIds.length === 0) {
      return { success: true, data: {} };
    }

    const supabase = getAnonSupabase();
    const { data, error } = await supabase
      .from("product_collections")
      .select("product_id, collection_id")
      .in("product_id", productIds);

    if (error) {
      return { success: false, error: "Failed to fetch product collections" };
    }

    const mapping: Record<string, string[]> = {};
    (data || []).forEach(
      (pc: { product_id: string; collection_id: string }) => {
        if (!mapping[pc.product_id]) {
          mapping[pc.product_id] = [];
        }
        mapping[pc.product_id].push(pc.collection_id);
      },
    );

    return { success: true, data: mapping };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get collection-product mappings for multiple collections
 * Returns mapping of collection_id -> product_id[]
 */
export async function getCollectionProductMappings(
  collectionIds: string[],
): Promise<{
  success: boolean;
  data?: Record<string, string[]>;
  error?: string;
}> {
  try {
    if (collectionIds.length === 0) {
      return { success: true, data: {} };
    }

    const supabase = getAnonSupabase();
    const { data, error } = await supabase
      .from("product_collections")
      .select("product_id, collection_id")
      .in("collection_id", collectionIds);

    if (error) {
      return { success: false, error: "Failed to fetch collection products" };
    }

    const mapping: Record<string, string[]> = {};
    (data || []).forEach(
      (pc: { product_id: string; collection_id: string }) => {
        if (!mapping[pc.collection_id]) {
          mapping[pc.collection_id] = [];
        }
        mapping[pc.collection_id].push(pc.product_id);
      },
    );

    return { success: true, data: mapping };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================
// Product Images Management Actions
// ============================================

export interface ProductImageInput {
  product_id: string;
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

/**
 * Get all images for a product
 */
export async function getProductImages(productId: string): Promise<{
  success: boolean;
  data?: ProductImage[];
  error?: string;
}> {
  try {
    const supabase = getAnonSupabase();
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order")
      .order("created_at");

    if (error) {
      return { success: false, error: "Failed to fetch product images" };
    }

    return { success: true, data: data as ProductImage[] };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Add an image to a product
 */
export async function addProductImage(imageData: ProductImageInput): Promise<{
  success: boolean;
  data?: ProductImage;
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();

    // If this is set as primary, unset other primary images
    if (imageData.is_primary) {
      await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", imageData.product_id);
    }

    const { data, error } = await supabase
      .from("product_images")
      .insert([
        {
          product_id: imageData.product_id,
          image_url: imageData.image_url,
          alt_text: imageData.alt_text || null,
          is_primary: imageData.is_primary || false,
          sort_order: imageData.sort_order || 0,
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: "Failed to add product image" };
    }

    return { success: true, data: data as ProductImage };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update a product image
 */
export async function updateProductImage(
  imageId: string,
  updates: Partial<ProductImageInput>,
): Promise<{
  success: boolean;
  data?: ProductImage;
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();

    // If setting as primary, unset other primary images for this product
    if (updates.is_primary) {
      // First get the product_id for this image
      const { data: imageData } = await supabase
        .from("product_images")
        .select("product_id")
        .eq("id", imageId)
        .single();

      if (imageData) {
        await supabase
          .from("product_images")
          .update({ is_primary: false })
          .eq("product_id", imageData.product_id);
      }
    }

    const { data, error } = await supabase
      .from("product_images")
      .update(updates)
      .eq("id", imageId)
      .select()
      .single();

    if (error) {
      return { success: false, error: "Failed to update product image" };
    }

    return { success: true, data: data as ProductImage };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a product image
 */
export async function deleteProductImage(imageId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();

    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      return { success: false, error: "Failed to delete product image" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get related products based on shared categories
 */
export async function getRelatedProducts(
  productId: string,
  limit: number = 4,
): Promise<ProductsResponse> {
  try {
    const supabase = getAnonSupabase();

    // Get the current product's categories
    const { data: productCategories, error: categoriesError } = await supabase
      .from("product_categories")
      .select("category_id")
      .eq("product_id", productId);

    if (
      categoriesError ||
      !productCategories ||
      productCategories.length === 0
    ) {
      // If no categories found, return random products
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .neq("id", productId)
        .limit(limit);

      if (error) {
        return { success: false, error: "Failed to fetch related products" };
      }

      return {
        success: true,
        data: data as Product[],
        total: data?.length || 0,
      };
    }

    const categoryIds = productCategories.map((pc) => pc.category_id);

    // Find other products that share these categories
    const { data: relatedProductCategories, error: relatedError } =
      await supabase
        .from("product_categories")
        .select("product_id")
        .in("category_id", categoryIds)
        .neq("product_id", productId);

    if (relatedError) {
      return { success: false, error: "Failed to fetch related products" };
    }

    if (!relatedProductCategories || relatedProductCategories.length === 0) {
      // If no related products found, return random products
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .neq("id", productId)
        .limit(limit);

      if (error) {
        return { success: false, error: "Failed to fetch related products" };
      }

      return {
        success: true,
        data: data as Product[],
        total: data?.length || 0,
      };
    }

    // Count how many categories each product shares
    const productCounts: Record<string, number> = {};
    relatedProductCategories.forEach((rpc) => {
      productCounts[rpc.product_id] = (productCounts[rpc.product_id] || 0) + 1;
    });

    // Sort by number of shared categories (most relevant first)
    const sortedProductIds = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([productId]) => productId)
      .slice(0, limit);

    if (sortedProductIds.length === 0) {
      return { success: true, data: [], total: 0 };
    }

    // Get the actual product data
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", sortedProductIds);

    if (error) {
      return { success: false, error: "Failed to fetch related products" };
    }

    // Sort the results to match the relevance order
    const sortedData = sortedProductIds
      .map((id) => data?.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    return {
      success: true,
      data: sortedData,
      total: sortedData.length,
    };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Reorder product images
 */
export async function reorderProductImages(
  imageOrders: { id: string; sort_order: number }[],
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();

    // Update each image's sort_order
    const updates = imageOrders.map((item) =>
      supabase
        .from("product_images")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id),
    );

    await Promise.all(updates);

    return { success: true };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}
