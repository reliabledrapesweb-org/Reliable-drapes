/**
 * Resend Email Service - Edge-Compatible (Fetch API)
 * Works on both Vercel (Serverless/Edge) and Cloudflare (Edge)
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_BATCH_API_URL = "https://api.resend.com/emails/batch";

// Default sender configuration
const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "newsletter@reliabledrapes.com";
const DEFAULT_FROM_NAME = process.env.RESEND_FROM_NAME || "Reliable Drapes";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: {
    email: string;
    name: string;
  };
}

interface BulkEmailOptions {
  recipients: string[];
  subject: string;
  html: string;
  text?: string;
  from?: {
    email: string;
    name: string;
  };
}

interface SendEmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

interface BulkSendResult {
  success: boolean;
  error?: string;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

function formatFrom(from?: { email: string; name: string }): string {
  const email = from?.email || DEFAULT_FROM_EMAIL;
  const name = from?.name || DEFAULT_FROM_NAME;
  return `${name} <${email}>`;
}

/**
 * Check if Resend is properly configured
 */
export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Send a single email using Resend REST API
 */
export async function sendEmail(
  options: EmailOptions,
): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    return {
      success: false,
      error:
        "Resend API key not configured. Please add RESEND_API_KEY to environment variables.",
    };
  }

  const { to, subject, html, text, from } = options;

  const toAddresses = Array.isArray(to) ? to : [to];

  const payload = {
    from: formatFrom(from),
    to: toAddresses,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""),
  };

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();

      return {
        success: false,
        error: `Resend API error: ${response.status} - ${errorBody}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred while sending email";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send bulk emails using Resend Batch API (for newsletters)
 * Sends in batches of 100 to respect Resend's batch limit
 */
export async function sendBulkEmail(
  options: BulkEmailOptions,
): Promise<BulkSendResult> {
  if (!isResendConfigured()) {
    return {
      success: false,
      error:
        "Resend API key not configured. Please add RESEND_API_KEY to environment variables.",
      sent: 0,
      failed: options.recipients.length,
      errors: [],
    };
  }

  const { recipients, subject, html, text, from } = options;

  // Resend batch API allows up to 100 emails per request
  const BATCH_SIZE = 100;
  const batches: string[][] = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    batches.push(recipients.slice(i, i + BATCH_SIZE));
  }

  let sent = 0;
  let failed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  const fromFormatted = formatFrom(from);
  const plainText = text || html.replace(/<[^>]*>/g, "");

  for (const batch of batches) {
    const payload = batch.map((email) => ({
      from: fromFormatted,
      to: [email],
      subject,
      html,
      text: plainText,
    }));

    try {
      const response = await fetch(RESEND_BATCH_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("[Resend] Batch send error:", response.status, errorBody);
        failed += batch.length;
        batch.forEach((email) => {
          errors.push({
            email,
            error: `API error: ${response.status}`,
          });
        });
      } else {
        sent += batch.length;
      }

      // Small delay between batches to avoid rate limiting
      if (batches.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      failed += batch.length;

      batch.forEach((email) => {
        errors.push({
          email,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });
    }
  }

  return {
    success: failed === 0,
    sent,
    failed,
    errors,
    error: failed > 0 ? `Failed to send ${failed} emails` : undefined,
  };
}

/**
 * Send a newsletter campaign to multiple recipients
 * Uses batch API for efficient bulk sending
 */
export async function sendNewsletterEmail(
  recipients: string[],
  subject: string,
  htmlContent: string,
  campaignName?: string,
): Promise<BulkSendResult> {
  return sendBulkEmail({
    recipients,
    subject,
    html: htmlContent,
  });
}
