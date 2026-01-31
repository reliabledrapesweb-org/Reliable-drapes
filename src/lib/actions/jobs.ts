"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export interface Job {
  id: string;
  title: string;
  experience: string;
  location: string;
  description: string;
  type: "Store" | "Corporate" | "Design" | "Warehouse";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  resume_url: string;
  cover_letter: string | null;
  desired_role: string | null;
  application_type: "specific" | "open";
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  created_at: string;
  updated_at: string;
}

// ============ JOB ACTIONS ============

/**
 * Get all active jobs (public)
 */
export async function getActiveJobs() {
  try {
    const supabase = await supabaseServer();
    
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data as Job[], error: null };
  } catch (error) {

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch jobs",
      data: null,
    };
  }
}

/**
 * Get all jobs (admin only)
 */
export async function getAllJobs() {
  try {
    const supabase = await supabaseServer();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
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
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data as Job[], error: null };
  } catch (error) {

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch jobs",
      data: null,
    };
  }
}

/**
 * Create a new job (admin only)
 */
export async function createJob(jobData: Omit<Job, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = await supabaseServer();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
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
      .from("jobs")
      .insert([jobData])
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/careers");
    revalidatePath("/admin/careers");

    return { success: true, data: data as Job, error: null };
  } catch (error) {

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create job",
      data: null,
    };
  }
}

/**
 * Update a job (admin only)
 */
export async function updateJob(id: string, updates: Partial<Omit<Job, "id" | "created_at" | "updated_at">>) {
  try {
    const supabase = await supabaseServer();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
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
      .from("jobs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/careers");
    revalidatePath("/admin/careers");

    return { success: true, data: data as Job, error: null };
  } catch (error) {

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update job",
      data: null,
    };
  }
}

/**
 * Delete a job (admin only)
 */
export async function deleteJob(id: string) {
  try {
    const supabase = await supabaseServer();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
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
      .from("jobs")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/careers");
    revalidatePath("/admin/careers");

    return { success: true, data: null, error: null };
  } catch (error) {

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete job",
      data: null,
    };
  }
}

/**
 * Toggle job active status (admin only)
 */
export async function toggleJobStatus(id: string, isActive: boolean) {
  return updateJob(id, { is_active: isActive });
}
