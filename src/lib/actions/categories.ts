"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAnonSupabase } from "@/lib/supabase/anon";
import { cookies } from "next/headers";

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
  // Get auth token from cookies or header
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;

  if (!token) {
    return {
      success: false,
      error: "Authorization required",
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
