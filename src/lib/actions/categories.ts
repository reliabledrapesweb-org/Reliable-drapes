"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export async function createCategoryAction(data: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order?: number;
  is_featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  published?: boolean;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return {
      success: false,
      error: "Authorization required",
      details: userErr?.message,
    };
  }

  const admin = getAdminSupabase();

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      success: false,
      error: "Admin access required",
    };
  }

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
  } = data;

  if (!name || !slug) {
    return {
      success: false,
      error: "Name and slug are required",
    };
  }

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
    return {
      success: false,
      error: "Failed to create category",
      details: insertError.message,
    };
  }

  return {
    success: true,
    message: "Category created successfully",
    category,
  };
}
