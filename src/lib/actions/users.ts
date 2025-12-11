"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: "customer" | "admin";
  created_at: string;
  email?: string;
  last_sign_in_at?: string;
}

export interface UpdateUserInput {
  id: string;
  full_name?: string;
  role?: "customer" | "admin";
}

/**
 * Get all users with their profiles (admin only)
 */
export async function getAllUsers() {
  const supabase = await supabaseServer();

  // Get profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    return { success: false, error: profilesError.message, data: null };
  }

  // Get auth users to get email and last sign in
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error("Error fetching auth users:", authError);
    // Return profiles without auth data
    return { success: true, data: profiles, error: null };
  }

  // Merge profiles with auth data
  const usersWithAuth = profiles.map((profile) => {
    const authUser = authData.users.find((u) => u.id === profile.id);
    return {
      ...profile,
      email: authUser?.email || null,
      last_sign_in_at: authUser?.last_sign_in_at || null,
    };
  });

  return { success: true, data: usersWithAuth, error: null };
}

/**
 * Get user statistics (admin only)
 */
export async function getUserStats() {
  const supabase = await supabaseServer();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("role");

  if (error) {
    console.error("Error fetching user stats:", error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }

  const stats = {
    total: profiles.length,
    customers: profiles.filter((p) => p.role === "customer").length,
    admins: profiles.filter((p) => p.role === "admin").length,
  };

  return { success: true, data: stats, error: null };
}

/**
 * Update user profile (admin only)
 */
export async function updateUser(input: UpdateUserInput) {
  const supabase = await supabaseServer();

  // Verify current user is admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error("Authentication error:", authError);
    return { success: false, error: "Authentication required", data: null };
  }

  // Check if current user is admin
  const { data: currentUserProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching current user profile:", profileError);
    return { success: false, error: "Failed to verify admin status", data: null };
  }

  if (currentUserProfile?.role !== "admin") {
    console.error("Non-admin user attempted to update user:", user.id);
    return { success: false, error: "Admin privileges required", data: null };
  }

  const { id, ...updateData } = input;

  console.log("Updating user:", id, "with data:", updateData);

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message, data: null };
  }

  console.log("User updated successfully:", data);

  revalidatePath("/admin/customers");

  return { success: true, data, error: null };
}

/**
 * Delete user (admin only)
 * This will cascade delete the profile due to foreign key constraint
 */
export async function deleteUser(userId: string) {
  const supabase = await supabaseServer();

  // Delete from auth.users (this will cascade to profiles)
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/customers");

  return { success: true, error: null };
}

/**
 * Promote user to admin (admin only)
 */
export async function promoteToAdmin(userId: string) {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error promoting user:", error);
    return { success: false, error: error.message, data: null };
  }

  revalidatePath("/admin/customers");

  return { success: true, data, error: null };
}

/**
 * Demote admin to customer (admin only)
 */
export async function demoteFromAdmin(userId: string) {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: "customer" })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error demoting user:", error);
    return { success: false, error: error.message, data: null };
  }

  revalidatePath("/admin/customers");

  return { success: true, data, error: null };
}

/**
 * Search users by name or email
 */
export async function searchUsers(query: string) {
  const supabase = await supabaseServer();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("full_name", `%${query}%`)
    .order("created_at", { ascending: false});

  if (error) {
    console.error("Error searching users:", error);
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: profiles, error: null };
}
