/**
 * Server actions for site settings management
 */

"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAnonSupabase } from "@/lib/supabase/anon";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const businessHoursSchema = z
  .array(
    z.object({
      day: z.string().min(1),
      hours: z.string().min(1),
    }),
  )
  .min(1);

function validateBusinessHours(
  hours: unknown,
): Array<{ day: string; hours: string }> | null {
  const result = businessHoursSchema.safeParse(hours);
  return result.success ? result.data : null;
}

export type SiteSettings = {
  id: string;
  shop_enabled: boolean;
  coming_soon_message: string;
  commerce_features_enabled: boolean;
  commerce_coming_soon_message: string | null;
  gem_assessed_logo_enabled: boolean;
  gem_assessed_logo_url: string | null;
  gem_assessed_logo_size: "small" | "medium" | "large" | "extra-large";
  hero_video_enabled: boolean;
  hero_video_url: string | null;
  hero_video_type: "youtube" | "upload" | null;
  hero_carousel_images: string[] | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_youtube: string | null;
  social_linkedin: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  company_tagline: string | null;
  head_office_address: string | null;
  warehouse_address: string | null;
  contact_call_phone: string | null;
  business_hours: Array<{ day: string; hours: string }> | null;
  google_place_id: string | null;
  google_reviews_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type SiteSettingsFormData = Partial<
  Pick<
    SiteSettings,
    | "shop_enabled"
    | "coming_soon_message"
    | "commerce_features_enabled"
    | "commerce_coming_soon_message"
    | "gem_assessed_logo_enabled"
    | "gem_assessed_logo_url"
    | "gem_assessed_logo_size"
    | "hero_video_enabled"
    | "hero_video_url"
    | "hero_video_type"
    | "hero_carousel_images"
    | "social_instagram"
    | "social_facebook"
    | "social_twitter"
    | "social_youtube"
    | "social_linkedin"
    | "company_email"
    | "company_phone"
    | "company_address"
    | "company_tagline"
    | "head_office_address"
    | "warehouse_address"
    | "contact_call_phone"
    | "business_hours"
    | "google_place_id"
    | "google_reviews_enabled"
  >
>;

export interface SiteSettingsResponse {
  success: boolean;
  settings?: SiteSettings;
  error?: string;
}

/**
 * Get site settings (public)
 */
export async function getSiteSettings(): Promise<SiteSettingsResponse> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to fetch site settings",
      };
    }

    return {
      success: true,
      settings: data as SiteSettings,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Update site settings (admin only)
 */
export async function updateSiteSettings(
  formData: SiteSettingsFormData,
): Promise<SiteSettingsResponse> {
  try {
    const admin = getAdminSupabase();

    // Get the first (and only) settings row
    const { data: existingSettings, error: fetchError } = await admin
      .from("site_settings")
      .select("id")
      .limit(1)
      .single();

    if (fetchError || !existingSettings) {
      return {
        success: false,
        error: "Failed to find site settings",
      };
    }

    const { data, error } = await admin
      .from("site_settings")
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingSettings.id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Failed to update site settings",
      };
    }

    // Revalidate all relevant pages
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    revalidatePath("/cart");
    revalidatePath("/wishlist");
    revalidatePath("/admin/settings");

    return {
      success: true,
      settings: data as SiteSettings,
    };
  } catch {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Check if shop is enabled (public convenience method)
 */
export async function isShopEnabled(): Promise<boolean> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("site_settings")
      .select("shop_enabled")
      .limit(1)
      .single();

    if (error) {
      return true; // Default to enabled if error
    }

    return data?.shop_enabled ?? true;
  } catch {
    return true; // Default to enabled if error
  }
}

/**
 * Get hero video settings (public convenience method)
 */
export async function getHeroVideoSettings(): Promise<{
  enabled: boolean;
  url: string | null;
  type: "youtube" | "upload" | null;
}> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("site_settings")
      .select("hero_video_enabled, hero_video_url, hero_video_type")
      .limit(1)
      .single();

    if (error) {
      return { enabled: false, url: null, type: null };
    }

    return {
      enabled: data?.hero_video_enabled ?? false,
      url: data?.hero_video_url ?? null,
      type: data?.hero_video_type ?? null,
    };
  } catch {
    return { enabled: false, url: null, type: null };
  }
}

/**
 * Get commerce feature gate settings (public convenience method)
 */
export async function getCommerceFeatureSettings(): Promise<{
  enabled: boolean;
  message: string | null;
}> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "commerce_features_enabled, commerce_coming_soon_message, coming_soon_message",
      )
      .limit(1)
      .single();

    if (error) {
      return { enabled: true, message: null };
    }

    return {
      enabled: data?.commerce_features_enabled ?? true,
      message:
        data?.commerce_coming_soon_message ?? data?.coming_soon_message ?? null,
    };
  } catch {
    return { enabled: true, message: null };
  }
}

/**
 * Get GEM Assessed logo settings (public convenience method)
 */
export async function getGemAssessedLogoSettings(): Promise<{
  enabled: boolean;
  url: string | null;
  size: "small" | "medium" | "large" | "extra-large";
}> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "gem_assessed_logo_enabled, gem_assessed_logo_url, gem_assessed_logo_size",
      )
      .limit(1)
      .single();

    if (error) {
      return { enabled: false, url: null, size: "medium" };
    }

    return {
      enabled: data?.gem_assessed_logo_enabled ?? false,
      url: data?.gem_assessed_logo_url ?? null,
      size: data?.gem_assessed_logo_size ?? "medium",
    };
  } catch {
    return { enabled: false, url: null, size: "medium" };
  }
}

/**
 * Get social media links (public convenience method)
 */
export async function getSocialLinks(): Promise<{
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  youtube: string | null;
  linkedin: string | null;
}> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "social_instagram, social_facebook, social_twitter, social_youtube, social_linkedin",
      )
      .limit(1)
      .single();

    if (error) {
      return {
        instagram: null,
        facebook: null,
        twitter: null,
        youtube: null,
        linkedin: null,
      };
    }

    return {
      instagram: data?.social_instagram ?? null,
      facebook: data?.social_facebook ?? null,
      twitter: data?.social_twitter ?? null,
      youtube: data?.social_youtube ?? null,
      linkedin: data?.social_linkedin ?? null,
    };
  } catch {
    return {
      instagram: null,
      facebook: null,
      twitter: null,
      youtube: null,
      linkedin: null,
    };
  }
}

/**
 * Get company details (public convenience method)
 */
export async function getCompanyDetails(): Promise<{
  email: string | null;
  phone: string | null;
  address: string | null;
  tagline: string | null;
  headOfficeAddress: string | null;
  warehouseAddress: string | null;
  contactCallPhone: string | null;
  businessHours: Array<{ day: string; hours: string }> | null;
}> {
  try {
    const supabase = getAnonSupabase();

    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "company_email, company_phone, company_address, company_tagline, head_office_address, warehouse_address, contact_call_phone, business_hours",
      )
      .limit(1)
      .single();

    if (error) {
      return {
        email: null,
        phone: null,
        address: null,
        tagline: null,
        headOfficeAddress: null,
        warehouseAddress: null,
        contactCallPhone: null,
        businessHours: null,
      };
    }

    return {
      email: data?.company_email ?? null,
      phone: data?.company_phone ?? null,
      address: data?.company_address ?? null,
      tagline: data?.company_tagline ?? null,
      headOfficeAddress: data?.head_office_address ?? null,
      warehouseAddress: data?.warehouse_address ?? null,
      contactCallPhone: data?.contact_call_phone ?? null,
      businessHours: validateBusinessHours(data?.business_hours),
    };
  } catch {
    return {
      email: null,
      phone: null,
      address: null,
      tagline: null,
      headOfficeAddress: null,
      warehouseAddress: null,
      contactCallPhone: null,
      businessHours: null,
    };
  }
}
