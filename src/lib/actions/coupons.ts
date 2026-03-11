/**
 * Server actions for coupons/offers management
 */

"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAnonSupabase } from "@/lib/supabase/anon";
import { revalidatePath } from "next/cache";
import { calculateCouponDiscount } from "@/lib/utils/coupon";
import { verifyAdmin } from "@/lib/utils/admin-auth";

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed" | null;
  discount_value: number;
  min_order_value: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CouponFormData = {
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value?: number;
  max_uses?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
};

export interface CouponsResponse {
  success: boolean;
  coupons?: Coupon[];
  error?: string;
}

export interface CouponResponse {
  success: boolean;
  coupon?: Coupon;
  error?: string;
}

export type ValidatedCoupon = {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  calculated_discount: number;
};

export type ValidateCouponResult =
  | { success: true; data: ValidatedCoupon }
  | { success: false; error: string };

export async function validateCouponAction(
  code: string,
  subtotal: number,
): Promise<ValidateCouponResult> {
  try {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return { success: false, error: "Please enter a coupon code" };
    }

    const admin = getAdminSupabase();
    const { data: coupon, error } = await admin
      .from("coupons")
      .select("*")
      .ilike("code", trimmedCode)
      .single();

    if (error || !coupon) {
      return { success: false, error: "Invalid coupon code" };
    }

    if (!coupon.is_active) {
      return { success: false, error: "This coupon is no longer active" };
    }

    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { success: false, error: "This coupon is not yet valid" };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { success: false, error: "This coupon has expired" };
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return {
        success: false,
        error: "This coupon has reached its usage limit",
      };
    }

    if (coupon.min_order_value && subtotal < Number(coupon.min_order_value)) {
      return {
        success: false,
        error: `Minimum order value of ₹${coupon.min_order_value} required`,
      };
    }

    if (!coupon.discount_type) {
      return { success: false, error: "Invalid coupon configuration" };
    }

    const calculated_discount = calculateCouponDiscount(
      coupon.discount_type as "percentage" | "fixed",
      Number(coupon.discount_value),
      subtotal,
    );

    return {
      success: true,
      data: {
        code: coupon.code,
        discount_type: coupon.discount_type as "percentage" | "fixed",
        discount_value: Number(coupon.discount_value),
        calculated_discount,
      },
    };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all active coupons (public)
 */
export async function getActiveCoupons(): Promise<CouponsResponse> {
  try {
    const supabase = getAnonSupabase();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("is_active", true)
      .or(`valid_from.is.null,valid_from.lte.${now}`)
      .or(`valid_until.is.null,valid_until.gte.${now}`)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: "Failed to fetch coupons",
      };
    }

    // Filter out coupons that have reached max uses
    const availableCoupons = (data as Coupon[]).filter(
      (coupon) => !coupon.max_uses || coupon.current_uses < coupon.max_uses,
    );

    return {
      success: true,
      coupons: availableCoupons,
    };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get all coupons (admin - including inactive)
 */
export async function getAllCouponsAdmin(): Promise<CouponsResponse> {
  try {
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: "Failed to fetch coupons",
      };
    }

    return {
      success: true,
      coupons: data as Coupon[],
    };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Create a new coupon (admin only)
 */
export async function createCoupon(
  formData: CouponFormData,
): Promise<CouponResponse> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("coupons")
      .insert([
        {
          code: formData.code.toUpperCase(),
          description: formData.description || null,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          min_order_value: formData.min_order_value || 0,
          max_uses: formData.max_uses || null,
          valid_from: formData.valid_from || null,
          valid_until: formData.valid_until || null,
          is_active: formData.is_active ?? true,
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to create coupon",
      };
    }

    revalidatePath("/admin/coupons");
    revalidatePath("/shop");

    return {
      success: true,
      coupon: data as Coupon,
    };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Update an existing coupon (admin only)
 */
export async function updateCoupon(
  id: string,
  formData: Partial<CouponFormData>,
): Promise<CouponResponse> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const updateData: Record<string, unknown> = {
      ...formData,
      updated_at: new Date().toISOString(),
    };

    if (formData.code) {
      updateData.code = formData.code.toUpperCase();
    }

    const { data, error } = await admin
      .from("coupons")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to update coupon",
      };
    }

    revalidatePath("/admin/coupons");
    revalidatePath("/shop");

    return {
      success: true,
      coupon: data as Coupon,
    };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Delete a coupon (admin only)
 */
export async function deleteCoupon(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const { error } = await admin.from("coupons").delete().eq("id", id);

    if (error) {
      return {
        success: false,
        error: "Failed to delete coupon",
      };
    }

    revalidatePath("/admin/coupons");
    revalidatePath("/shop");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Toggle coupon active status (admin only)
 */
export async function toggleCouponStatus(
  id: string,
  isActive: boolean,
): Promise<CouponResponse> {
  try {
    await verifyAdmin();
    const admin = getAdminSupabase();

    const { data, error } = await admin
      .from("coupons")
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
        error: "Failed to update coupon status",
      };
    }

    revalidatePath("/admin/coupons");
    revalidatePath("/shop");

    return {
      success: true,
      coupon: data as Coupon,
    };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
