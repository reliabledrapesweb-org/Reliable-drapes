/**
 * Server actions for store management
 */

"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAnonSupabase } from "@/lib/supabase/anon";
import { revalidatePath } from "next/cache";

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  hours: Record<string, string> | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreFormData {
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  hours?: Record<string, string>;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
}

export interface StoresResponse {
  success: boolean;
  stores?: Store[];
  error?: string;
}

export interface StoreResponse {
  success: boolean;
  store?: Store;
  error?: string;
}

/**
 * Get all stores (public - only active stores)
 */
export async function getStores(): Promise<StoresResponse> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching stores:", error);
      return {
        success: false,
        error: "Failed to fetch stores",
      };
    }

    return {
      success: true,
      stores: data as Store[],
    };
  } catch (error) {
    console.error("Get stores exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get all stores (admin - including inactive)
 */
export async function getAllStoresAdmin(): Promise<StoresResponse> {
  try {
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("stores")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching stores (admin):", error);
      return {
        success: false,
        error: "Failed to fetch stores",
      };
    }

    return {
      success: true,
      stores: data as Store[],
    };
  } catch (error) {
    console.error("Get all stores (admin) exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get a single store by ID
 */
export async function getStoreById(id: string): Promise<StoreResponse> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching store:", error);
      return {
        success: false,
        error: "Store not found",
      };
    }

    return {
      success: true,
      store: data as Store,
    };
  } catch (error) {
    console.error("Get store by ID exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Create a new store (admin only)
 */
export async function createStore(
  formData: StoreFormData
): Promise<StoreResponse> {
  try {
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("stores")
      .insert([
        {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state || null,
          country: formData.country,
          postal_code: formData.postal_code || null,
          phone: formData.phone || null,
          email: formData.email || null,
          hours: formData.hours || null,
          latitude: formData.latitude || null,
          longitude: formData.longitude || null,
          is_active: formData.is_active ?? true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating store:", error);
      return {
        success: false,
        error: "Failed to create store",
      };
    }

    revalidatePath("/admin/stores");
    revalidatePath("/store-locator");

    return {
      success: true,
      store: data as Store,
    };
  } catch (error) {
    console.error("Create store exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Update an existing store (admin only)
 */
export async function updateStore(
  id: string,
  formData: Partial<StoreFormData>
): Promise<StoreResponse> {
  try {
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("stores")
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating store:", error);
      return {
        success: false,
        error: "Failed to update store",
      };
    }

    revalidatePath("/admin/stores");
    revalidatePath("/store-locator");

    return {
      success: true,
      store: data as Store,
    };
  } catch (error) {
    console.error("Update store exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Delete a store (admin only)
 */
export async function deleteStore(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = getAdminSupabase();

    const { error } = await admin.from("stores").delete().eq("id", id);

    if (error) {
      console.error("Error deleting store:", error);
      return {
        success: false,
        error: "Failed to delete store",
      };
    }

    revalidatePath("/admin/stores");
    revalidatePath("/store-locator");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete store exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Toggle store active status (admin only)
 */
export async function toggleStoreStatus(
  id: string,
  isActive: boolean
): Promise<StoreResponse> {
  try {
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("stores")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling store status:", error);
      return {
        success: false,
        error: "Failed to update store status",
      };
    }

    revalidatePath("/admin/stores");
    revalidatePath("/store-locator");

    return {
      success: true,
      store: data as Store,
    };
  } catch (error) {
    console.error("Toggle store status exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Search stores by city or state (public - only active stores)
 */
export async function searchStores(query: string): Promise<StoresResponse> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("is_active", true)
      .or(`city.ilike.%${query}%,state.ilike.%${query}%,name.ilike.%${query}%`)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error searching stores:", error);
      return {
        success: false,
        error: "Failed to search stores",
      };
    }

    return {
      success: true,
      stores: data as Store[],
    };
  } catch (error) {
    console.error("Search stores exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
