"use server";

import { supabaseServer } from "@/lib/supabase/server";

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============ CONTACT SUBMISSIONS ============

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved" | "archived";
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export async function createContactSubmission(
  data: Pick<ContactSubmission, "name" | "email" | "phone" | "subject" | "message">
): Promise<ActionResult<ContactSubmission>> {
  try {
    const supabase = await supabaseServer();

    const { data: submission, error } = await supabase
      .from("contact_submissions")
      .insert({
        ...data,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating contact submission:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: submission };
  } catch (error) {
    console.error("Error in createContactSubmission:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getContactSubmissions(): Promise<
  ActionResult<ContactSubmission[]>
> {
  try {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contact submissions:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error in getContactSubmissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateContactSubmission(
  id: string,
  updates: Partial<Pick<ContactSubmission, "status" | "admin_notes">>
): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("contact_submissions")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating contact submission:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateContactSubmission:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteContactSubmission(
  id: string
): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting contact submission:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteContactSubmission:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============ CONSULTATION REQUESTS ============

export interface ConsultationRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  preferred_date?: string;
  preferred_time?: string;
  message?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export async function createConsultationRequest(
  data: Pick<ConsultationRequest, "name" | "email" | "phone" | "service_type" | "preferred_date" | "preferred_time" | "message">
): Promise<ActionResult<ConsultationRequest>> {
  try {
    const supabase = await supabaseServer();

    const { data: request, error } = await supabase
      .from("consultation_requests")
      .insert({
        ...data,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating consultation request:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: request };
  } catch (error) {
    console.error("Error in createConsultationRequest:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getConsultationRequests(): Promise<
  ActionResult<ConsultationRequest[]>
> {
  try {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("consultation_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching consultation requests:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error in getConsultationRequests:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateConsultationRequest(
  id: string,
  updates: Partial<Pick<ConsultationRequest, "status" | "admin_notes">>
): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("consultation_requests")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating consultation request:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateConsultationRequest:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteConsultationRequest(
  id: string
): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("consultation_requests")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting consultation request:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteConsultationRequest:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============ NEWSLETTER SUBSCRIBERS ============

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: "active" | "unsubscribed";
  subscribed_at: string;
  unsubscribed_at?: string;
}

export async function createNewsletterSubscriber(
  data: Pick<NewsletterSubscriber, "email" | "name">
): Promise<ActionResult<NewsletterSubscriber>> {
  try {
    const supabase = await supabaseServer();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", data.email)
      .single();

    if (existing) {
      if (existing.status === "active") {
        return { success: false, error: "This email is already subscribed" };
      } else {
        // Reactivate unsubscribed email
        const { data: updated, error } = await supabase
          .from("newsletter_subscribers")
          .update({ status: "active", unsubscribed_at: null })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true, data: updated };
      }
    }

    const { data: subscriber, error } = await supabase
      .from("newsletter_subscribers")
      .insert({
        ...data,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating newsletter subscriber:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: subscriber };
  } catch (error) {
    console.error("Error in createNewsletterSubscriber:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getNewsletterSubscribers(): Promise<
  ActionResult<NewsletterSubscriber[]>
> {
  try {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });

    if (error) {
      console.error("Error fetching newsletter subscribers:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error in getNewsletterSubscribers:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateNewsletterSubscriber(
  id: string,
  updates: Partial<Pick<NewsletterSubscriber, "status" | "name">>
): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const updateData: any = { ...updates };
    if (updates.status === "unsubscribed") {
      updateData.unsubscribed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating newsletter subscriber:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateNewsletterSubscriber:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteNewsletterSubscriber(
  id: string
): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting newsletter subscriber:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteNewsletterSubscriber:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
