"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAnonSupabase } from "@/lib/supabase/anon";
import type { CatalogueCategoryId } from "@/lib/types/category.types";
import { verifyAdmin } from "@/lib/utils/admin-auth";

const getErrorCode = (error: unknown): string | undefined => {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code?: unknown }).code);
  }
  return undefined;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

const isMissingImageUrlColumnError = (error: unknown): boolean => {
  const code = getErrorCode(error);
  const message = getErrorMessage(error).toLowerCase();
  return code === "42703" && message.includes("image_url");
};

export interface CatalogueCategory {
  id: CatalogueCategoryId;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean | null;
  parent_id: CatalogueCategoryId | null;
  path: string;
  created_at: string;
  updated_at: string;
  catalogue_count?: number;
  children?: CatalogueCategory[];
  level?: number;
}

export interface CreateCatalogueCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
  parent_id?: CatalogueCategoryId | null;
}

export interface UpdateCatalogueCategoryInput
  extends Partial<CreateCatalogueCategoryInput> {
  id: CatalogueCategoryId;
}

// Get all active categories (public)
export async function getCatalogueCategories(): Promise<{
  success: boolean;
  data?: CatalogueCategory[];
  error?: string;
}> {
  try {
    const supabase = getAnonSupabase();
    // RLS policy handles the is_active filtering (COALESCE(is_active, true) = true)
    // No need for additional filters here
    const { data, error } = await supabase
      .from("catalogue_categories")
      .select("*")
      .order("sort_order")
      .order("name");

    if (error) throw error;
    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error fetching catalogue categories:", getErrorMessage(error));
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Get all categories with counts (admin)
export async function getAllCatalogueCategories(): Promise<{
  success: boolean;
  data?: CatalogueCategory[];
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("catalogue_categories")
      .select("*")
      .order("sort_order")
      .order("name");

    if (error) throw error;

    // Get catalogue counts
    const categoriesWithCounts = await Promise.all(
      data.map(async (category) => {
        const { count } = await supabase
          .from("catalogues")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id);
        return { ...category, catalogue_count: count || 0 };
      }),
    );

    return { success: true, data: categoriesWithCounts };
  } catch {
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Create category
export async function createCatalogueCategory(
  input: CreateCatalogueCategoryInput,
): Promise<{ success: boolean; data?: CatalogueCategory; error?: string }> {
  try {
    await verifyAdmin();
    const supabase = getAdminSupabase();

    // Generate slug from name if not provided
    const slug =
      input.slug ||
      input.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const insertPayload = {
      name: input.name,
      slug,
      description: input.description || null,
      image_url: input.image_url || null,
      sort_order: input.sort_order || 0,
      is_active: input.is_active ?? true,
      parent_id: input.parent_id || null,
    };

    let { data, error } = await supabase
      .from("catalogue_categories")
      .insert(insertPayload)
      .select()
      .single();

    // Backward compatibility for environments where image_url migration is pending.
    if (error && isMissingImageUrlColumnError(error)) {
      const legacyInsertPayload: Omit<typeof insertPayload, "image_url"> = {
        name: insertPayload.name,
        slug: insertPayload.slug,
        description: insertPayload.description,
        sort_order: insertPayload.sort_order,
        is_active: insertPayload.is_active,
        parent_id: insertPayload.parent_id,
      };
      const retryResult = await supabase
        .from("catalogue_categories")
        .insert(legacyInsertPayload)
        .select()
        .single();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) throw error;
    return { success: true, data: data as CatalogueCategory };
  } catch (error: unknown) {
    if (getErrorCode(error) === "23505") {
      return {
        success: false,
        error: "A category with this name already exists",
      };
    }
    return { success: false, error: getErrorMessage(error) };
  }
}

// Update category
export async function updateCatalogueCategory(
  input: UpdateCatalogueCategoryInput,
): Promise<{ success: boolean; data?: CatalogueCategory; error?: string }> {
  try {
    await verifyAdmin();
    const supabase = getAdminSupabase();
    const { id, ...updates } = input;
    const normalizedUpdates: Partial<CreateCatalogueCategoryInput> & {
      image_url?: string | null;
    } = {
      ...updates,
    };
    if (updates.image_url !== undefined) {
      normalizedUpdates.image_url = updates.image_url || null;
    }

    // Generate slug if name is updated but slug isn't
    if (normalizedUpdates.name && !normalizedUpdates.slug) {
      normalizedUpdates.slug = normalizedUpdates.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }

    let { data, error } = await supabase
      .from("catalogue_categories")
      .update(normalizedUpdates)
      .eq("id", id)
      .select()
      .single();

    // Backward compatibility for environments where image_url migration is pending.
    if (
      error &&
      isMissingImageUrlColumnError(error) &&
      "image_url" in normalizedUpdates
    ) {
      const legacyUpdates = { ...normalizedUpdates };
      delete legacyUpdates.image_url;
      const retryResult = await supabase
        .from("catalogue_categories")
        .update(legacyUpdates)
        .eq("id", id)
        .select()
        .single();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) throw error;
    return { success: true, data: data as CatalogueCategory };
  } catch (error: unknown) {
    if (getErrorCode(error) === "23505") {
      return {
        success: false,
        error: "A category with this name already exists",
      };
    }
    return { success: false, error: getErrorMessage(error) };
  }
}

// Delete category
export async function deleteCatalogueCategory(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdmin();
    const supabase = getAdminSupabase();

    // Check if category has child categories
    const { count: childCount } = await supabase
      .from("catalogue_categories")
      .select("*", { count: "exact", head: true })
      .eq("parent_id", id);

    if (childCount && childCount > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${childCount} subcategory(s). Delete subcategories first.`,
      };
    }

    // Check if category has catalogues
    const { count } = await supabase
      .from("catalogues")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (count && count > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${count} catalogue(s). Reassign or delete catalogues first.`,
      };
    }

    const { error } = await supabase
      .from("catalogue_categories")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete category" };
  }
}
