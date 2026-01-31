"use server";

import { getAdminSupabase, getAnonSupabase } from "@/lib/supabase/admin";

export interface CatalogueCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  catalogue_count?: number;
}

export interface CreateCatalogueCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCatalogueCategoryInput extends Partial<CreateCatalogueCategoryInput> {
  id: string;
}

// Get all active categories (public)
export async function getCatalogueCategories(): Promise<{
  success: boolean;
  data?: CatalogueCategory[];
  error?: string;
}> {
  try {
    console.log("[Debug] Starting getCatalogueCategories...");
    const supabase = getAnonSupabase();
    console.log("[Debug] Got supabase client");
    // RLS policy handles the is_active filtering (COALESCE(is_active, true) = true)
    // No need for additional filters here
    const { data, error } = await supabase
      .from("catalogue_categories")
      .select("*")
      .order("sort_order")
      .order("name");

    if (error) {
      console.error("[Debug] Supabase error:", error);
      throw error;
    }
    console.log("[Debug] Raw categories from DB:", data?.length, "items");
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("[Debug] Error fetching catalogue categories:", error?.message || error);
    return { success: false, error: error?.message || "Failed to fetch categories" };
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
  } catch (error) {
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Create category
export async function createCatalogueCategory(
  input: CreateCatalogueCategoryInput,
): Promise<{ success: boolean; data?: CatalogueCategory; error?: string }> {
  try {
    const supabase = getAdminSupabase();

    // Generate slug from name if not provided
    const slug =
      input.slug ||
      input.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const { data, error } = await supabase
      .from("catalogue_categories")
      .insert({
        name: input.name,
        slug,
        description: input.description || null,
        sort_order: input.sort_order || 0,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "A category with this name already exists",
      };
    }
    return { success: false, error: "Failed to create category" };
  }
}

// Update category
export async function updateCatalogueCategory(
  input: UpdateCatalogueCategoryInput,
): Promise<{ success: boolean; data?: CatalogueCategory; error?: string }> {
  try {
    const supabase = getAdminSupabase();
    const { id, ...updates } = input;

    // Generate slug if name is updated but slug isn't
    if (updates.name && !updates.slug) {
      updates.slug = updates.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }

    const { data, error } = await supabase
      .from("catalogue_categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "A category with this name already exists",
      };
    }
    return { success: false, error: "Failed to update category" };
  }
}

// Delete category
export async function deleteCatalogueCategory(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminSupabase();

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
  } catch (error) {
    return { success: false, error: "Failed to delete category" };
  }
}
