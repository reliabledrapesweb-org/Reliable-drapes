import { getAdminSupabase } from "@/lib/supabaseAdmin";
import { cache } from "react";

// Helper to build hierarchical tree
function buildCategoryTree(categories: any[]): any[] {
  const categoryMap = new Map();
  const rootCategories: any[] = [];

  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
    if (!category.parent_id) {
      rootCategories.push(categoryMap.get(category.id));
    }
  });

  categories.forEach((category) => {
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children.push(categoryMap.get(category.id));
      }
    }
  });

  return rootCategories;
}

export const getCategories = cache(
  async (params?: {
    includeProducts?: boolean;
    parentOnly?: boolean;
    featured?: boolean;
  }) => {
    const {
      includeProducts = false,
      parentOnly = false,
      featured = false,
    } = params || {};

    const admin = getAdminSupabase();

    const fields = [
      "id",
      "name",
      "slug",
      "description",
      "image_url",
      "parent_id",
      "sort_order",
      "is_featured",
      "created_at",
    ];

    if (!parentOnly) {
      fields.push(`
      subcategories:categories!parent_id(
        id, name, slug, description, image_url, sort_order, is_featured
      )
    `);
    }

    if (includeProducts) {
      fields.push(`
      product_categories!inner(
        product:products(id, name, price, image_url, created_at)
      )
    `);
    }

    let query = admin
      .from("categories")
      .select(fields.join(","))
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (parentOnly) {
      query = query.is("parent_id", null);
    }

    if (featured) {
      query = query.eq("is_featured", true);
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error("categories fetch error", error);
      throw new Error("Failed to fetch categories");
    }

    const processedCategories = parentOnly
      ? categories
      : buildCategoryTree(categories || []);

    return {
      categories: processedCategories,
      meta: {
        total: categories?.length || 0,
        includeProducts,
        parentOnly,
        featured,
      },
    };
  },
);

export const getCategoryBySlug = cache(
  async (
    slug: string,
    params?: { includeProducts?: boolean; page?: number; perPage?: number },
  ) => {
    const { includeProducts = false, page = 1, perPage = 20 } = params || {};

    if (!slug) {
      throw new Error("Category slug is required");
    }

    const admin = getAdminSupabase();

    const { data: category, error: categoryError } = await admin
      .from("categories")
      .select(
        `
      id, name, slug, description, image_url, parent_id, sort_order,
      is_featured, meta_title, meta_description, created_at,
      parent:categories!parent_id(id, name, slug),
      subcategories:categories!parent_id(
        id, name, slug, description, image_url, sort_order, is_featured
      )
    `,
      )
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (categoryError || !category) {
      throw new Error("Category not found");
    }

    let products = null;
    let productsMeta = null;

    if (includeProducts) {
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { data: productsData, error: productsError } = await admin
        .from("product_categories")
        .select(
          `
        product:products(
          id, name, description, image_url, price, visible_to, created_at,
          product_images!inner(image_url, alt_text, is_primary)
        )
      `,
        )
        .eq("category_id", category.id)
        .range(from, to);

      if (!productsError) {
        products =
          productsData?.map((item) => item.product).filter(Boolean) || [];
        productsMeta = { page, perPage, total: products.length };
      }
    }

    return {
      category: {
        ...category,
        ...(products && { products }),
      },
      meta: {
        includeProducts,
        ...(productsMeta && { products: productsMeta }),
      },
    };
  },
);
