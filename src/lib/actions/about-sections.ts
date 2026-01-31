"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export interface AboutSection {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  content_json: Record<string, unknown> | null;
  image_url: string | null;
  image_url_2: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AboutSectionInput = Omit<
  AboutSection,
  "id" | "created_at" | "updated_at"
>;

/**
 * Get all active about sections for public display
 */
export async function getAboutSections() {
  try {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("about_sections")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return { success: true, data: data as AboutSection[], error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch about sections",
      data: null,
    };
  }
}

/**
 * Get a single about section by key
 */
export async function getAboutSectionByKey(sectionKey: string) {
  try {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("about_sections")
      .select("*")
      .eq("section_key", sectionKey)
      .eq("is_active", true)
      .single();

    if (error) throw error;

    return { success: true, data: data as AboutSection, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch about section",
      data: null,
    };
  }
}

/**
 * Get all about sections (admin only)
 */
export async function getAllAboutSections() {
  try {
    const supabase = await supabaseServer();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Admin privileges required");
    }

    const { data, error } = await supabase
      .from("about_sections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return { success: true, data: data as AboutSection[], error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch about sections",
      data: null,
    };
  }
}

/**
 * Create a new about section (admin only)
 */
export async function createAboutSection(
  sectionData: Omit<AboutSectionInput, "id">,
) {
  try {
    const supabase = await supabaseServer();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Admin privileges required");
    }

    const { data, error } = await supabase
      .from("about_sections")
      .insert([sectionData])
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/about");
    revalidatePath("/admin/about-sections");

    return { success: true, data: data as AboutSection, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create about section",
      data: null,
    };
  }
}

/**
 * Update an about section (admin only)
 */
export async function updateAboutSection(
  id: string,
  updates: Partial<Omit<AboutSectionInput, "id">>,
) {
  try {
    const supabase = await supabaseServer();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Admin privileges required");
    }

    const { data, error } = await supabase
      .from("about_sections")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/about");
    revalidatePath("/admin/about-sections");

    return { success: true, data: data as AboutSection, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update about section",
      data: null,
    };
  }
}

/**
 * Delete an about section (admin only)
 */
export async function deleteAboutSection(id: string) {
  try {
    const supabase = await supabaseServer();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Admin privileges required");
    }

    const { error } = await supabase
      .from("about_sections")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/about");
    revalidatePath("/admin/about-sections");

    return { success: true, data: null, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete about section",
      data: null,
    };
  }
}

/**
 * Toggle about section active status (admin only)
 */
export async function toggleAboutSectionStatus(id: string, isActive: boolean) {
  return updateAboutSection(id, { is_active: isActive });
}
