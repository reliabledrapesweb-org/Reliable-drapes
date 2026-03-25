/**
 * Transactional Email Templates
 * For contact confirmations, consultation confirmations, and admin notifications
 */

const BRAND_PRIMARY = "#2F2582";
const BRAND_DARK = "#1a1a2e";
const BRAND_SECONDARY = "#a099ff";

function baseTemplate(subject: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_DARK} 100%); padding: 24px 40px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">Reliable Drapes</h1>
              <p style="margin: 6px 0 0; color: ${BRAND_SECONDARY}; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Premium Home Furnishings</p>
            </td>
          </tr>
          <tr>
            <td class="content" style="padding: 32px 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #fafafa; text-align: center;">
              <p style="margin: 0; color: #888888; font-size: 12px;">
                Reliable Drapes — A Unit of Shree Ambica Furnishings (India) Pvt. Ltd.
              </p>
              <p style="margin: 8px 0 0; color: #999999; font-size: 11px;">
                This is an automated email. Please do not reply directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export function contactConfirmationEmail(name: string, subject: string): string {
  return baseTemplate(
    "We received your message",
    `
    <h2 style="margin: 0 0 16px; color: ${BRAND_PRIMARY}; font-size: 22px;">Thank you, ${name}!</h2>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      We've received your message regarding <strong>"${subject}"</strong> and our team will get back to you shortly.
    </p>
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
      In the meantime, feel free to explore our <a href="https://reliabledrapes.org/e-catalogue" style="color: ${BRAND_PRIMARY};">e-catalogue</a> or reach us at <a href="mailto:contact@reliabledrapes.org" style="color: ${BRAND_PRIMARY};">contact@reliabledrapes.org</a>.
    </p>
    `,
  );
}

export function consultationConfirmationEmail(
  name: string,
  serviceType: string,
  preferredDate?: string | null,
  preferredTime?: string | null,
): string {
  const dateInfo =
    preferredDate || preferredTime
      ? `<p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          Your preferred schedule: <strong>${preferredDate || ""}${preferredDate && preferredTime ? " at " : ""}${preferredTime || ""}</strong>.
          We'll confirm availability soon.
        </p>`
      : "";

  return baseTemplate(
    "Consultation Request Received",
    `
    <h2 style="margin: 0 0 16px; color: ${BRAND_PRIMARY}; font-size: 22px;">Thank you, ${name}!</h2>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      We've received your consultation request for <strong>${serviceType}</strong>. Our style expert team will review your requirements and reach out to you.
    </p>
    ${dateInfo}
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
      If you have any questions, contact us at <a href="mailto:contact@reliabledrapes.org" style="color: ${BRAND_PRIMARY};">contact@reliabledrapes.org</a>.
    </p>
    `,
  );
}

export function adminNewContactEmail(
  name: string,
  email: string,
  phone: string | undefined,
  subject: string,
  message: string,
): string {
  return baseTemplate(
    `New Contact: ${subject}`,
    `
    <h2 style="margin: 0 0 16px; color: ${BRAND_PRIMARY}; font-size: 20px;">New Contact Form Submission</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
      <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee;">${name}</td></tr>
      <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: ${BRAND_PRIMARY};">${email}</a></td></tr>
      ${phone ? `<tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee;">${phone}</td></tr>` : ""}
      <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Subject:</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee;">${subject}</td></tr>
    </table>
    <div style="background: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
      <p style="margin: 0 0 4px; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
      <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
    </div>
    <a href="https://reliabledrapes.org/admin/communications/contact" style="display: inline-block; padding: 10px 24px; background-color: ${BRAND_PRIMARY}; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">View in Admin Panel</a>
    `,
  );
}

export function adminNewConsultationEmail(
  name: string,
  email: string,
  phone: string,
  serviceType: string,
  message?: string | null,
): string {
  return baseTemplate(
    `New Consultation: ${serviceType}`,
    `
    <h2 style="margin: 0 0 16px; color: ${BRAND_PRIMARY}; font-size: 20px;">New Consultation Request</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
      <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee;">${name}</td></tr>
      <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: ${BRAND_PRIMARY};">${email}</a></td></tr>
      <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee;">${phone}</td></tr>
      <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Service:</strong></td><td style="padding: 8px 0; color: #333; font-size: 14px; border-bottom: 1px solid #eee;">${serviceType}</td></tr>
    </table>
    ${message ? `<div style="background: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 16px;"><p style="margin: 0 0 4px; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message</p><p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p></div>` : ""}
    <a href="https://reliabledrapes.org/admin/communications/consultations" style="display: inline-block; padding: 10px 24px; background-color: ${BRAND_PRIMARY}; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">View in Admin Panel</a>
    `,
  );
}
