"use server";

import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Catalogue {
  id: string;
  title: string;
  description: string | null;
  subtitle: string | null;
  category_id: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  category_legacy?: string; // Keep for backward compatibility during migration
  file_url: string;
  pdf_url?: string;
  thumbnail_url: string | null;
  image_url: string | null;
  badge: "new" | "discount" | null;
  discount_value: string | null;
  file_size: number;
  download_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCatalogueInput {
  title: string;
  description?: string;
  category_id: string;
  file_url: string;
  thumbnail_url?: string;
  badge?: "new" | "discount" | null;
  discount_value?: string;
}

export interface UpdateCatalogueInput extends Partial<CreateCatalogueInput> {
  id: string;
  is_active?: boolean;
}

/**
 * Get all active catalogues
 */
export async function getCatalogues() {
  try {
    const supabase = supabaseAdmin();

    const { data, error } = await supabase
      .from("catalogues")
      .select(
        `
        *,
        category:category_id (
          id,
          name,
          slug
        )
      `,
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
  } catch (err) {
    return { success: false, error: "Failed to fetch catalogues", data: null };
  }
}

/**
 * Get all catalogues (admin only)
 */
export async function getAllCatalogues() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("catalogues")
    .select(
      `
      *,
      category:category_id (
        id,
        name,
        slug
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

/**
 * Get a single catalogue by ID
 */
export async function getCatalogueById(id: string) {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("catalogues")
    .select(
      `
      *,
      category:category_id (
        id,
        name,
        slug
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

/**
 * Create a new catalogue (admin only)
 */
export async function createCatalogue(input: CreateCatalogueInput) {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("catalogues")
    .insert({
      title: input.title,
      description: input.description || null,
      category_id: input.category_id,
      file_url: input.file_url,
      thumbnail_url: input.thumbnail_url || null,
      badge: input.badge || null,
      discount_value: input.discount_value || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  revalidatePath("/e-catalogue");
  revalidatePath("/admin/catalogues");

  return { success: true, data, error: null };
}

/**
 * Update a catalogue (admin only)
 */
export async function updateCatalogue(input: UpdateCatalogueInput) {
  const supabase = await supabaseServer();

  const { id, ...updateData } = input;

  const { data, error } = await supabase
    .from("catalogues")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  revalidatePath("/e-catalogue");
  revalidatePath("/admin/catalogues");

  return { success: true, data, error: null };
}

/**
 * Delete a catalogue (admin only)
 */
export async function deleteCatalogue(id: string) {
  const supabase = await supabaseServer();

  const { error } = await supabase.from("catalogues").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/e-catalogue");
  revalidatePath("/admin/catalogues");

  return { success: true, error: null };
}

/**
 * Increment download count
 */
export async function incrementDownloadCount(id: string) {
  const supabase = await supabaseServer();

  const { error } = await supabase.rpc("increment_catalogue_downloads", {
    catalogue_id: id,
  });

  if (error) {
    // If RPC doesn't exist, fallback to manual increment
    const { data: catalogue } = await supabase
      .from("catalogues")
      .select("download_count")
      .eq("id", id)
      .single();

    if (catalogue) {
      await supabase
        .from("catalogues")
        .update({ download_count: (catalogue.download_count || 0) + 1 })
        .eq("id", id);
    }
  }

  return { success: true };
}
