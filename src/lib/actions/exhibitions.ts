/**
 * Server actions for exhibitions management
 */

"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAnonSupabase } from "@/lib/supabase/anon";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/utils/admin-auth";

export type Exhibition = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ExhibitionFormData = {
  title?: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  image_url?: string;
  is_active?: boolean;
};

export interface ExhibitionsResponse {
  success: boolean;
  exhibitions?: Exhibition[];
  error?: string;
}

export interface ExhibitionResponse {
  success: boolean;
  exhibition?: Exhibition;
  error?: string;
}

/**
 * Get all active exhibitions (public)
 */
export async function getExhibitions(): Promise<ExhibitionsResponse> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("exhibitions")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: "Failed to fetch exhibitions",
      };
    }

    return {
      success: true,
      exhibitions: data as Exhibition[],
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get all exhibitions (admin - including inactive)
 */
export async function getAllExhibitionsAdmin(): Promise<ExhibitionsResponse> {
  try {
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("exhibitions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: "Failed to fetch exhibitions",
      };
    }

    return {
      success: true,
      exhibitions: data as Exhibition[],
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get a single exhibition by ID
 */
export async function getExhibitionById(
  id: string,
): Promise<ExhibitionResponse> {
  try {
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("exhibitions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return {
        success: false,
        error: "Exhibition not found",
      };
    }

    return {
      success: true,
      exhibition: data as Exhibition,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Create a new exhibition (admin only)
 */
export async function createExhibition(
  formData: ExhibitionFormData,
): Promise<ExhibitionResponse> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();
    const title =
      formData.title?.trim() || `Exhibition Photo ${new Date().toISOString().slice(0, 10)}`;

    const { data, error } = await admin
      .from("exhibitions")
      .insert([
        {
          title,
          description: formData.description || null,
          location: formData.location || null,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          image_url: formData.image_url || null,
          is_active: formData.is_active ?? true,
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to create exhibition",
      };
    }

    revalidatePath("/admin/exhibitions");
    revalidatePath("/exhibitions-events");

    return {
      success: true,
      exhibition: data as Exhibition,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Update an existing exhibition (admin only)
 */
export async function updateExhibition(
  id: string,
  formData: Partial<ExhibitionFormData>,
): Promise<ExhibitionResponse> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (formData.title !== undefined) {
      const trimmedTitle = formData.title.trim();
      if (trimmedTitle) {
        updatePayload.title = trimmedTitle;
      }
    }
    if (formData.description !== undefined) {
      updatePayload.description = formData.description || null;
    }
    if (formData.location !== undefined) {
      updatePayload.location = formData.location || null;
    }
    if (formData.start_date !== undefined) {
      updatePayload.start_date = formData.start_date || null;
    }
    if (formData.end_date !== undefined) {
      updatePayload.end_date = formData.end_date || null;
    }
    if (formData.image_url !== undefined) {
      updatePayload.image_url = formData.image_url || null;
    }
    if (formData.is_active !== undefined) {
      updatePayload.is_active = formData.is_active;
    }

    const { data, error } = await admin
      .from("exhibitions")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to update exhibition",
      };
    }

    revalidatePath("/admin/exhibitions");
    revalidatePath("/exhibitions-events");

    return {
      success: true,
      exhibition: data as Exhibition,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Delete an exhibition (admin only)
 */
export async function deleteExhibition(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const { error } = await admin.from("exhibitions").delete().eq("id", id);

    if (error) {
      return {
        success: false,
        error: "Failed to delete exhibition",
      };
    }

    revalidatePath("/admin/exhibitions");
    revalidatePath("/exhibitions-events");

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Toggle exhibition active status (admin only)
 */
export async function toggleExhibitionStatus(
  id: string,
  isActive: boolean,
): Promise<ExhibitionResponse> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("exhibitions")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to update exhibition status",
      };
    }

    revalidatePath("/admin/exhibitions");
    revalidatePath("/exhibitions-events");

    return {
      success: true,
      exhibition: data as Exhibition,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export type ExhibitionYear = {
  id: string;
  year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ExhibitionItem = {
  id: string;
  year_id: string;
  type: "exhibition" | "moment" | "news";
  title: string;
  description: string | null;
  image_url: string | null;
  source_name: string | null;
  article_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function getExhibitionYears(): Promise<{
  success: boolean;
  data?: ExhibitionYear[];
  error?: string;
}> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("exhibition_years")
      .select("*")
      .eq("is_active", true)
      .order("year", { ascending: false });

    if (error) {
      return {
        success: false,
        error: "Failed to fetch exhibition years",
      };
    }

    return {
      success: true,
      data: data as ExhibitionYear[],
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function getExhibitionItems(
  yearId: string,
  type?: string,
): Promise<{
  success: boolean;
  data?: ExhibitionItem[];
  error?: string;
}> {
  try {
    const supabase = getAnonSupabase();

    let query = supabase
      .from("exhibition_items")
      .select("*")
      .eq("year_id", yearId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (type !== undefined) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: "Failed to fetch exhibition items",
      };
    }

    return {
      success: true,
      data: data as ExhibitionItem[],
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function createExhibitionYear(year: number): Promise<{
  success: boolean;
  data?: ExhibitionYear;
  error?: string;
}> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("exhibition_years")
      .insert([{ year, is_active: true }])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to create exhibition year",
      };
    }

    revalidatePath("/exhibitions-events");
    revalidatePath("/admin/exhibitions");

    return {
      success: true,
      data: data as ExhibitionYear,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function updateExhibitionYear(
  id: string,
  data: { year?: number; is_active?: boolean },
): Promise<{
  success: boolean;
  data?: ExhibitionYear;
  error?: string;
}> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const { data: updated, error } = await admin
      .from("exhibition_years")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to update exhibition year",
      };
    }

    revalidatePath("/exhibitions-events");
    revalidatePath("/admin/exhibitions");

    return {
      success: true,
      data: updated as ExhibitionYear,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function deleteExhibitionYear(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const { error } = await admin
      .from("exhibition_years")
      .delete()
      .eq("id", id);

    if (error) {
      return {
        success: false,
        error: "Failed to delete exhibition year",
      };
    }

    revalidatePath("/exhibitions-events");
    revalidatePath("/admin/exhibitions");

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function createExhibitionItem(
  data: Omit<ExhibitionItem, "id" | "created_at" | "updated_at">,
): Promise<{
  success: boolean;
  data?: ExhibitionItem;
  error?: string;
}> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const { data: created, error } = await admin
      .from("exhibition_items")
      .insert([data])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to create exhibition item",
      };
    }

    revalidatePath("/exhibitions-events");
    revalidatePath("/admin/exhibitions");

    return {
      success: true,
      data: created as ExhibitionItem,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function updateExhibitionItem(
  id: string,
  data: Partial<ExhibitionItem>,
): Promise<{
  success: boolean;
  data?: ExhibitionItem;
  error?: string;
}> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const { data: updated, error } = await admin
      .from("exhibition_items")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to update exhibition item",
      };
    }

    revalidatePath("/exhibitions-events");
    revalidatePath("/admin/exhibitions");

    return {
      success: true,
      data: updated as ExhibitionItem,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function deleteExhibitionItem(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const { error } = await admin
      .from("exhibition_items")
      .delete()
      .eq("id", id);

    if (error) {
      return {
        success: false,
        error: "Failed to delete exhibition item",
      };
    }

    revalidatePath("/exhibitions-events");
    revalidatePath("/admin/exhibitions");

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function toggleExhibitionItemStatus(
  id: string,
  isActive: boolean,
): Promise<{
  success: boolean;
  data?: ExhibitionItem;
  error?: string;
}> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("exhibition_items")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to update exhibition item status",
      };
    }

    revalidatePath("/exhibitions-events");
    revalidatePath("/admin/exhibitions");

    return {
      success: true,
      data: data as ExhibitionItem,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
