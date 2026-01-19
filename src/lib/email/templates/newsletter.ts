/**
 * Newsletter Email Templates
 * Branded HTML templates for Reliable Drapes email campaigns
 */

// Brand colors
const BRAND_PRIMARY = "#2F2582";
const BRAND_SECONDARY = "#a099ff";
const BRAND_DARK = "#1a1a2e";

interface NewsletterTemplateOptions {
  subject: string;
  content: string;
  preheaderText?: string;
  unsubscribeUrl?: string;
  companyAddress?: string;
}

/**
 * Wrap newsletter content in a branded HTML email template
 */
export function createNewsletterTemplate(
  options: NewsletterTemplateOptions,
): string {
  const {
    subject,
    content,
    preheaderText = "",
    unsubscribeUrl = "{{unsubscribe_url}}",
    companyAddress = "Reliable Drapes, India",
  } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      height: 100% !important;
      background-color: #f4f4f4;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 10px !important;
      }
      .content {
        padding: 20px !important;
      }
      .header-logo {
        width: 150px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <!-- Preheader text (hidden preview text) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheaderText || subject}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Email wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main container -->
        <table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header with logo -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_DARK} 100%); padding: 30px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <!-- Logo text fallback -->
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                      Reliable Drapes
                    </h1>
                    <p style="margin: 8px 0 0; color: ${BRAND_SECONDARY}; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                      Premium Home Furnishings
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main content area -->
          <tr>
            <td class="content" style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 0;">
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #fafafa;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Social links (optional) -->
                    <p style="margin: 0 0 15px; color: #666666; font-size: 14px;">
                      Follow us for the latest updates
                    </p>
                    
                    <!-- Company info -->
                    <p style="margin: 0 0 15px; color: #888888; font-size: 12px;">
                      ${companyAddress}
                    </p>
                    
                    <!-- Unsubscribe link -->
                    <p style="margin: 0; color: #888888; font-size: 12px;">
                      <a href="${unsubscribeUrl}" style="color: ${BRAND_PRIMARY}; text-decoration: underline;">
                        Unsubscribe
                      </a>
                      from our newsletter
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
        <!-- Footer note -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding: 20px;">
              <p style="margin: 0; color: #999999; font-size: 11px;">
                This email was sent by Reliable Drapes. 
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Create a simple promotional email template
 */
export function createPromoTemplate(options: {
  headline: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
}): string {
  const { headline, body, ctaText, ctaUrl, imageUrl } = options;

  let contentHtml = `
    <h2 style="margin: 0 0 20px; color: ${BRAND_PRIMARY}; font-size: 24px; font-weight: 600;">
      ${headline}
    </h2>
  `;

  if (imageUrl) {
    contentHtml += `
      <img src="${imageUrl}" alt="" style="width: 100%; max-width: 520px; height: auto; border-radius: 8px; margin-bottom: 20px;">
    `;
  }

  contentHtml += `
    <div style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      ${body}
    </div>
  `;

  if (ctaText && ctaUrl) {
    contentHtml += `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="border-radius: 6px; background-color: ${BRAND_PRIMARY};">
            <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px;">
              ${ctaText}
            </a>
          </td>
        </tr>
      </table>
    `;
  }

  return createNewsletterTemplate({
    subject: headline,
    content: contentHtml,
    preheaderText: body.slice(0, 100),
  });
}

/**
 * Wrap raw HTML content in the newsletter template
 * This is used when the admin provides their own HTML content
 */
export function wrapContentInTemplate(
  subject: string,
  rawContent: string,
  options?: Partial<NewsletterTemplateOptions>,
): string {
  // Style the raw content with default typography
  const styledContent = `
    <div style="color: #333333; font-size: 16px; line-height: 1.6;">
      ${rawContent}
    </div>
  `;

  return createNewsletterTemplate({
    subject,
    content: styledContent,
    ...options,
  });
}
