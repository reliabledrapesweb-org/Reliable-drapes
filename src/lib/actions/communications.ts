"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { sendBulkEmail, isSendGridConfigured } from "@/lib/email/sendgrid";
import { wrapContentInTemplate } from "@/lib/email/templates/newsletter";

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
  data: Pick<
    ContactSubmission,
    "name" | "email" | "phone" | "subject" | "message"
  >,
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
      return { success: false, error: error.message };
    }

    return { success: true, data: submission };
  } catch (error) {
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
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateContactSubmission(
  id: string,
  updates: Partial<Pick<ContactSubmission, "status" | "admin_notes">>,
): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("contact_submissions")
      .update(updates)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteContactSubmission(
  id: string,
): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============ CONSULTATION REQUESTS (STYLE EXPERT) ============

export interface ConsultationRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  preferred_date?: string;
  preferred_time?: string;
  message?: string;

  // Enhanced fields for better data collection
  project_type?: string; // new_home, renovation, single_room, multiple_rooms
  room_types?: string[]; // living_room, bedroom, kitchen, etc.
  property_type?: string; // house, apartment, office, commercial
  budget_range?: string; // under_5k, 5k_10k, 10k_25k, 25k_50k, over_50k
  timeline?: string; // asap, 1_3_months, 3_6_months, 6plus_months, exploring
  style_preferences?: string[]; // modern, traditional, contemporary, etc.
  current_challenges?: string;
  inspiration_images?: string[];

  // Workflow management fields
  status: "pending" | "confirmed" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  assigned_to?: string;
  follow_up_date?: string;
  consultation_date?: string;
  estimated_value?: number;
  converted_to_sale?: boolean;
  sale_amount?: number;
  source?: string;

  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export async function createConsultationRequest(
  data: Pick<
    ConsultationRequest,
    | "name"
    | "email"
    | "phone"
    | "service_type"
    | "preferred_date"
    | "preferred_time"
    | "message"
    | "project_type"
    | "room_types"
    | "property_type"
    | "budget_range"
    | "timeline"
    | "style_preferences"
    | "current_challenges"
    | "inspiration_images"
  >,
): Promise<ActionResult<ConsultationRequest>> {
  try {
    const supabase = await supabaseServer();

    const { data: request, error } = await supabase
      .from("consultation_requests")
      .insert({
        ...data,
        status: "pending",
        priority: "medium",
        source: "website",
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: request };
  } catch (error) {
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
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateConsultationRequest(
  id: string,
  updates: Partial<
    Pick<
      ConsultationRequest,
      | "status"
      | "admin_notes"
      | "priority"
      | "assigned_to"
      | "follow_up_date"
      | "consultation_date"
      | "estimated_value"
      | "converted_to_sale"
      | "sale_amount"
    >
  >,
): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("consultation_requests")
      .update(updates)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteConsultationRequest(
  id: string,
): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("consultation_requests")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
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
  data: Pick<NewsletterSubscriber, "email" | "name">,
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
          console.error("Error creating contact submission:", error);
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
      return { success: false, error: error.message };
    }

    return { success: true, data: subscriber };
  } catch (error) {
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
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateNewsletterSubscriber(
  id: string,
  updates: Partial<Pick<NewsletterSubscriber, "status" | "name">>,
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteNewsletterSubscriber(
  id: string,
): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============ NEWSLETTER CAMPAIGNS ============

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  status: "draft" | "sent" | "failed";
  recipient_count: number;
  sent_at?: string;
  created_at: string;
}

export async function createNewsletterCampaign(
  data: Pick<NewsletterCampaign, "subject" | "content" | "recipient_count">,
): Promise<ActionResult<NewsletterCampaign>> {
  try {
    const supabase = await supabaseServer();

    const { data: campaign, error } = await supabase
      .from("newsletter_campaigns")
      .insert({
        subject: data.subject,
        content: data.content,
        recipient_count: data.recipient_count,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: campaign };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getNewsletterCampaigns(): Promise<
  ActionResult<NewsletterCampaign[]>
> {
  try {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendNewsletterCampaign(
  campaignId: string,
  recipientEmails: string[],
): Promise<ActionResult<{ sent: number; failed: number }>> {
  try {
    const supabase = await supabaseServer();

    // Get the campaign
    const { data: campaign, error: fetchError } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (fetchError || !campaign) {
      return { success: false, error: "Campaign not found" };
    }

    // Check if SendGrid is configured
    if (!isSendGridConfigured()) {
      console.warn(
        "[Newsletter] SendGrid not configured - emails will not be sent",
      );

      // Update campaign status to indicate configuration issue
      await supabase
        .from("newsletter_campaigns")
        .update({
          status: "failed",
          admin_notes:
            "SendGrid API key not configured. Please add SENDGRID_API_KEY to environment variables.",
        })
        .eq("id", campaignId);

      return {
        success: false,
        error:
          "SendGrid not configured. Please add SENDGRID_API_KEY to environment variables.",
      };
    }

    // Wrap the campaign content in branded template
    const htmlContent = wrapContentInTemplate(
      campaign.subject,
      campaign.content,
      {
        preheaderText: campaign.preview_text,
      },
    );

    // Send emails using SendGrid
    const result = await sendBulkEmail({
      recipients: recipientEmails,
      subject: campaign.subject,
      html: htmlContent,
    });

    // Update campaign status based on result
    const { error: updateError } = await supabase
      .from("newsletter_campaigns")
      .update({
        status: result.success
          ? "sent"
          : result.sent > 0
            ? "partial"
            : "failed",
        sent_at: new Date().toISOString(),
        recipient_count: result.sent,
        admin_notes:
          result.failed > 0
            ? `Sent: ${result.sent}, Failed: ${result.failed}`
            : undefined,
      })
      .eq("id", campaignId);

    if (updateError) {
      return { success: false, error: "Failed to update campaign status" };
    }

    if (!result.success && result.sent === 0) {
      return { success: false, error: result.error || "Failed to send emails" };
    }

    return {
      success: true,
      data: {
        sent: result.sent,
        failed: result.failed,
      },
    };
  } catch (error) {
    // Update campaign status to failed
    const supabase = await supabaseServer();
    await supabase
      .from("newsletter_campaigns")
      .update({ status: "failed" })
      .eq("id", campaignId);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
