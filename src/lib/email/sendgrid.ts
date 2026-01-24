/**
 * SendGrid Email Service - Edge-Compatible (Fetch API)
 * Works on both Vercel (Serverless/Edge) and Cloudflare (Edge)
 */

const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";

// Default sender configuration
const DEFAULT_FROM_EMAIL =
  process.env.SENDGRID_FROM_EMAIL || "newsletter@reliabledrapes.com";
const DEFAULT_FROM_NAME = process.env.SENDGRID_FROM_NAME || "Reliable Drapes";

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

/**
 * Check if SendGrid is properly configured
 */
export function isSendGridConfigured(): boolean {
  return !!process.env.SENDGRID_API_KEY;
}

/**
 * Send a single email using SendGrid REST API
 */
export async function sendEmail(
  options: EmailOptions,
): Promise<SendEmailResult> {
  if (!isSendGridConfigured()) {
    console.error("[SendGrid] API key not configured");
    return {
      success: false,
      error:
        "SendGrid API key not configured. Please add SENDGRID_API_KEY to environment variables.",
    };
  }

  const { to, subject, html, text, from } = options;

  // Normalize 'to' to array format
  const toAddresses = Array.isArray(to) ? to : [to];

  const payload = {
    personalizations: [
      {
        to: toAddresses.map((email) => ({ email })),
      },
    ],
    from: {
      email: from?.email || DEFAULT_FROM_EMAIL,
      name: from?.name || DEFAULT_FROM_NAME,
    },
    subject,
    content: [
      {
        type: "text/plain",
        value: text || html.replace(/<[^>]*>/g, ""),
      },
      {
        type: "text/html",
        value: html,
      },
    ],
  };

  try {
    const response = await fetch(SENDGRID_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[SendGrid] API error:", response.status, errorBody);
      return {
        success: false,
        error: `SendGrid API error: ${response.status} - ${errorBody}`,
      };
    }

    const messageId = response.headers.get("x-message-id") || undefined;

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error("[SendGrid] Error sending email:", error);

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
 * Send bulk emails using SendGrid (for newsletters)
 * Sends in batches to respect rate limits
 */
export async function sendBulkEmail(
  options: BulkEmailOptions,
): Promise<BulkSendResult> {
  if (!isSendGridConfigured()) {
    console.error("[SendGrid] API key not configured");
    return {
      success: false,
      error:
        "SendGrid API key not configured. Please add SENDGRID_API_KEY to environment variables.",
      sent: 0,
      failed: options.recipients.length,
      errors: [],
    };
  }

  const { recipients, subject, html, text, from } = options;

  // SendGrid allows up to 1000 personalizations per request
  const BATCH_SIZE = 1000;
  const batches: string[][] = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    batches.push(recipients.slice(i, i + BATCH_SIZE));
  }

  let sent = 0;
  let failed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const batch of batches) {
    const payload = {
      personalizations: batch.map((email) => ({
        to: [{ email }],
      })),
      from: {
        email: from?.email || DEFAULT_FROM_EMAIL,
        name: from?.name || DEFAULT_FROM_NAME,
      },
      subject,
      content: [
        {
          type: "text/plain",
          value: text || html.replace(/<[^>]*>/g, ""),
        },
        {
          type: "text/html",
          value: html,
        },
      ],
    };

    try {
      const response = await fetch(SENDGRID_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          "[SendGrid] Batch send error:",
          response.status,
          errorBody,
        );
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
      console.error("[SendGrid] Batch send error:", error);
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
 * Uses personalizations for efficient bulk sending
 */
export async function sendNewsletterEmail(
  recipients: string[],
  subject: string,
  htmlContent: string,
  campaignName?: string,
): Promise<BulkSendResult> {
  console.log(
    `[SendGrid] Sending newsletter "${campaignName || subject}" to ${recipients.length} recipients`,
  );

  return sendBulkEmail({
    recipients,
    subject,
    html: htmlContent,
  });
}
