import sgMail from "@sendgrid/mail";

// Initialize SendGrid with API key
const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

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
 * Send a single email using SendGrid
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

  try {
    const msg = {
      to,
      from: {
        email: from?.email || DEFAULT_FROM_EMAIL,
        name: from?.name || DEFAULT_FROM_NAME,
      },
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for plain text version
    };

    const [response] = await sgMail.send(msg);

    return {
      success: true,
      messageId: response.headers["x-message-id"] as string,
    };
  } catch (error) {
    console.error("[SendGrid] Error sending email:", error);

    // Extract meaningful error message from SendGrid response
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

  // SendGrid recommends batches of 1000 for personalization
  const BATCH_SIZE = 1000;
  const batches: string[][] = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    batches.push(recipients.slice(i, i + BATCH_SIZE));
  }

  let sent = 0;
  let failed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const batch of batches) {
    try {
      // Create personalized messages for each recipient
      const messages = batch.map((email) => ({
        to: email,
        from: {
          email: from?.email || DEFAULT_FROM_EMAIL,
          name: from?.name || DEFAULT_FROM_NAME,
        },
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
      }));

      // Send batch
      await sgMail.send(messages);
      sent += batch.length;

      // Small delay between batches to avoid rate limiting
      if (batches.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("[SendGrid] Batch send error:", error);
      failed += batch.length;

      // Log individual errors if available
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
