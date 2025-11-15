import { getAdminSupabase } from "@/lib/supabaseAdmin";
import { getAnonSupabase } from "@/lib/supabaseAnon";
import { ControllerResult, HTTP_STATUS } from "@/lib/types/controllers";

export async function getCategories(req: Request): Promise<ControllerResult> {
  try {
    const url = new URL(req.url);
    const includeProducts = url.searchParams.get("include_products") === "true";
    const parentOnly = url.searchParams.get("parent_only") === "true";
    const featured = url.searchParams.get("featured") === "true";

    const admin = getAdminSupabase();

    // Build the query
    let fields = [
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
        id,
        name,
        slug,
        description,
        image_url,
        sort_order,
        is_featured
      )
    `);
    }

    if (includeProducts) {
      fields.push(`
        product_categories!inner(
          product:products(
            id,
            name,
            price,
            image_url,
            created_at
          )
        )
      `);
    }

    let query = admin
      .from("categories")
      .select(fields.join(","))
      .eq("published", true)
      .order("sort_order", { ascending: true });

    // Apply filters
    if (parentOnly) {
      query = query.is("parent_id", null);
    }

    if (featured) {
      query = query.eq("is_featured", true);
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error("categories fetch error", error);
      return {
        success: false,
        error: "Failed to fetch categories",
        details: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }

    // Build hierarchical structure if not parent_only
    const processedCategories = parentOnly
      ? categories
      : buildCategoryTree(categories || []);

    return {
      success: true,
      data: {
        categories: processedCategories,
        meta: {
          total: categories?.length || 0,
          includeProducts,
          parentOnly,
          featured,
        },
      },
      statusCode: HTTP_STATUS.OK,
    };
  } catch (err) {
    console.error("/api/categories error", err);
    return {
      success: false,
      error: "Internal server error",
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }
}

export async function getCategoryBySlug(
  req: Request
): Promise<ControllerResult> {
  try {
    const url = new URL(req.url);
    const slug = url.pathname.split("/").pop();
    const includeProducts = url.searchParams.get("include_products") === "true";
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = Math.min(
      parseInt(url.searchParams.get("per_page") || "20"),
      100
    );

    if (!slug) {
      return {
        success: false,
        error: "Category slug is required",
        statusCode: HTTP_STATUS.BAD_REQUEST,
      };
    }

    const admin = getAdminSupabase();

    // Get category details
    const { data: category, error: categoryError } = await admin
      .from("categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        image_url,
        parent_id,
        sort_order,
        is_featured,
        meta_title,
        meta_description,
        created_at,
        parent:categories!parent_id(
          id,
          name,
          slug
        ),
        subcategories:categories!parent_id(
          id,
          name,
          slug,
          description,
          image_url,
          sort_order,
          is_featured
        )
      `
      )
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (categoryError || !category) {
      return {
        success: false,
        error: "Category not found",
        statusCode: HTTP_STATUS.NOT_FOUND,
      };
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
            id,
            name,
            description,
            image_url,
            price,
            visible_to,
            created_at,
            product_images!inner(
              image_url,
              alt_text,
              is_primary
            )
          )
        `
        )
        .eq("category_id", category.id)
        .range(from, to);

      if (productsError) {
        console.error("category products fetch error", productsError);
      } else {
        products =
          productsData?.map((item) => item.product).filter(Boolean) || [];
        productsMeta = {
          page,
          perPage,
          total: products.length,
        };
      }
    }

    return {
      success: true,
      data: {
        category: {
          ...category,
          ...(products && { products }),
        },
        meta: {
          includeProducts,
          ...(productsMeta && { products: productsMeta }),
        },
      },
      statusCode: HTTP_STATUS.OK,
    };
  } catch (err) {
    console.error("/api/categories/[slug] error", err);
    return {
      success: false,
      error: "Internal server error",
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }
}

export async function createCategory(req: Request): Promise<ControllerResult> {
  try {
    // Check admin permissions
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return {
        success: false,
        error: "Authorization required (Bearer token)",
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      };
    }

    const anon = getAnonSupabase();
    const admin = getAdminSupabase();

    const { data: userData, error: userErr } = await anon.auth.getUser(token);
    if (userErr || !userData?.user?.id) {
      return {
        success: false,
        error: "Invalid token",
        details: userErr?.message,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      };
    }

    // Check if user is admin
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return {
        success: false,
        error: "Admin access required",
        statusCode: HTTP_STATUS.FORBIDDEN,
      };
    }

    const body = await req.json().catch(() => ({}));
    const {
      name,
      slug,
      description,
      image_url,
      parent_id,
      sort_order,
      is_featured,
      meta_title,
      meta_description,
      published = true,
    } = body;

    if (!name || !slug) {
      return {
        success: false,
        error: "Name and slug are required",
        statusCode: HTTP_STATUS.BAD_REQUEST,
      };
    }

    // Insert category
    const { data: category, error: insertError } = await admin
      .from("categories")
      .insert({
        name,
        slug,
        description,
        image_url,
        parent_id,
        sort_order: sort_order || 0,
        is_featured: is_featured || false,
        meta_title,
        meta_description,
        published,
      })
      .select()
      .single();

    if (insertError) {
      console.error("category insert error", insertError);
      return {
        success: false,
        error: "Failed to create category",
        details: insertError.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }

    return {
      success: true,
      data: {
        message: "Category created successfully",
        category,
      },
      statusCode: HTTP_STATUS.CREATED,
    };
  } catch (err) {
    console.error("/api/categories POST error", err);
    return {
      success: false,
      error: "Internal server error",
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }
}

// Helper function to build hierarchical category tree
function buildCategoryTree(categories: any[]): any[] {
  const categoryMap = new Map();
  const rootCategories: any[] = [];

  // First pass: create map and identify root categories
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
    if (!category.parent_id) {
      rootCategories.push(categoryMap.get(category.id));
    }
  });

  // Second pass: build parent-child relationships
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
