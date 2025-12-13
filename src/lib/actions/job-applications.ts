"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import type { JobApplication } from "./jobs";

export interface JobApplicationWithJob extends JobApplication {
  job_title?: string;
  job_type?: string;
}

/**
 * Submit a job application (public)
 */
export async function submitJobApplication(applicationData: {
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  resume_url: string;
  cover_letter?: string;
}) {
  try {
    const supabase = await supabaseServer();
    
    const { data, error } = await supabase
      .from("job_applications")
      .insert([{
        ...applicationData,
        status: "pending"
      }])
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/careers/applications");

    return { success: true, data: data as JobApplication, error: null };
  } catch (error) {
    console.error("Error submitting job application:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit application",
      data: null,
    };
  }
}

/**
 * Get all job applications (admin only)
 */
export async function getAllJobApplications() {
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
      .from("job_applications")
      .select(`
        *,
        jobs:job_id (
          title,
          type
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Format the data to include job details
    const formattedData = data?.map(app => ({
      ...app,
      job_title: app.jobs?.title,
      job_type: app.jobs?.type,
    })) as JobApplicationWithJob[];

    return { success: true, data: formattedData, error: null };
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch applications",
      data: null,
    };
  }
}

/**
 * Get applications for a specific job (admin only)
 */
export async function getJobApplicationsByJobId(jobId: string) {
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
      .from("job_applications")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data as JobApplication[], error: null };
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch applications",
      data: null,
    };
  }
}

/**
 * Update application status (admin only)
 */
export async function updateApplicationStatus(
  id: string,
  status: "pending" | "reviewed" | "shortlisted" | "rejected"
) {
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
      .from("job_applications")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/careers/applications");

    return { success: true, data: data as JobApplication, error: null };
  } catch (error) {
    console.error("Error updating application status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
      data: null,
    };
  }
}

/**
 * Delete a job application (admin only)
 */
export async function deleteJobApplication(id: string) {
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
      .from("job_applications")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/careers/applications");

    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("Error deleting application:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete application",
      data: null,
    };
  }
}

/**
 * Get application statistics (admin only)
 */
export async function getApplicationStats() {
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
      .from("job_applications")
      .select("status");

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pending: data?.filter(app => app.status === "pending").length || 0,
      reviewed: data?.filter(app => app.status === "reviewed").length || 0,
      shortlisted: data?.filter(app => app.status === "shortlisted").length || 0,
      rejected: data?.filter(app => app.status === "rejected").length || 0,
    };

    return { success: true, data: stats, error: null };
  } catch (error) {
    console.error("Error fetching application stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stats",
      data: null,
    };
  }
}
