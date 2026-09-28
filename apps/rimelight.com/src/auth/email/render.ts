import type { EmailMessages } from "#auth/email/messages"
import { getEmailMessages } from "./messages"

export interface EmailTemplateProps {
  bannerAlt?: string
  common: EmailMessages["common"]
  contentHtml: string
}

export function renderEmailTemplate({
  bannerAlt = "Rimelight Entertainment",
  common,
  contentHtml
}: EmailTemplateProps): string {
  const bannerSrc = "https://cdn.rimelight.com/Images/email-banner.webp"
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0; padding:0; background:#f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin:0; padding:0; background:#f5f5f5;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; margin:0 auto; background:#ffffff;">
          <tr>
            <td style="padding:0; line-height:0;">
              <img src="${bannerSrc}" alt="${bannerAlt}" width="600" height="120" style="display:block; width:100%; max-width:600px; height:120px; object-fit:cover; object-position:center; border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px; background:#000000; color:#ffffff; text-align:center; font-family:Arial, sans-serif; font-size:12px; line-height:1.6;">
              <a href="https://rimelight.com" style="color:#ffffff; text-decoration:none;">${common.website}</a>
              <span style="color:#777777; padding:0 8px;">|</span>
              <a href="https://rimelight.com/contact" style="color:#ffffff; text-decoration:none;">${common.contact}</a>
              <span style="color:#777777; padding:0 8px;">|</span>
              <a href="https://rimelight.com/privacy" style="color:#ffffff; text-decoration:none;">${common.privacy}</a>
              <p style="margin:12px 0 0; color:#aaaaaa;">© ${year} Rimelight Entertainment</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function renderVerificationEmail(url: string, locale = "en"): Promise<string> {
  const messages = getEmailMessages(locale)
  const contentHtml = `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h1 style="color: #333; font-size: 22px; margin-bottom: 16px;">${messages.verification.title}</h1>
    <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
      ${messages.verification.description}
    </p>
    <a
      href="${url}"
      style="display: inline-block; padding: 14px 28px; background-color: #0064d7; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600;"
    >
      ${messages.verification.button}
    </a>
    <p style="color: #888; font-size: 13px; margin-top: 24px;">${messages.verification.copy_link}</p>
    <p style="word-break: break-all; color: #9ca3af; font-size: 11px; font-family: monospace; background: #f3f4f6; padding: 8px; border-radius: 4px;">
      ${url}
    </p>
  </div>`

  return renderEmailTemplate({
    bannerAlt: "Verify your email",
    common: messages.common,
    contentHtml
  })
}

export async function renderPasswordResetEmail(url: string, locale = "en"): Promise<string> {
  const messages = getEmailMessages(locale)
  const contentHtml = `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h1 style="color: #333; font-size: 22px; margin-bottom: 16px;">${messages.passwordReset.title}</h1>
    <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
      ${messages.passwordReset.description}
    </p>
    <a
      href="${url}"
      style="display: inline-block; padding: 14px 28px; background-color: #0064d7; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600;"
    >
      ${messages.passwordReset.button}
    </a>
    <p style="color: #888; font-size: 13px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
      ${messages.passwordReset.ignore}
    </p>
  </div>`

  return renderEmailTemplate({
    bannerAlt: "Reset your Rimelight password",
    common: messages.common,
    contentHtml
  })
}

export async function renderSignupNotificationEmail(
  signInUrl: string,
  locale = "en"
): Promise<string> {
  const messages = getEmailMessages(locale)
  const contentHtml = `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h1 style="color: #dc2626; font-size: 22px; margin-bottom: 16px;">${messages.signupNotification.title}</h1>
    <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
      ${messages.signupNotification.description}
    </p>
    <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
      ${messages.signupNotification.sign_in_prefix} <a href="${signInUrl}" style="color: #0064d7;">${messages.signupNotification.sign_in}</a> ${messages.signupNotification.sign_in_suffix}
    </p>
    <p style="color: #888; font-size: 13px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
      ${messages.signupNotification.ignore}
    </p>
  </div>`

  return renderEmailTemplate({
    bannerAlt: "Rimelight security notice",
    common: messages.common,
    contentHtml
  })
}

export async function renderContactEmail({
  name,
  email,
  subject,
  message
}: {
  name: string
  email: string
  subject?: string
  message: string
}): Promise<string> {
  const messages = getEmailMessages()
  const contentHtml = `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h1 style="color: #111; font-size: 22px; margin-bottom: 16px;">New Contact Message</h1>
    
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563;">
        <strong>Sender Name:</strong> ${name}
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563;">
        <strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #0064d7; text-decoration: none;">${email}</a>
      </p>
      ${
        subject
          ? `<p style="margin: 0; font-size: 14px; color: #4b5563;">
        <strong>Subject:</strong> ${subject}
      </p>`
          : ""
      }
    </div>

    <h2 style="color: #374151; font-size: 16px; margin-bottom: 8px;">Message Content:</h2>
    <div style="white-space: pre-wrap; font-family: inherit; font-size: 15px; line-height: 1.6; color: #1f2937; background: #ffffff; padding: 16px; border-left: 4px solid #0064d7; border-radius: 4px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
      ${message}
    </div>
  </div>`

  return renderEmailTemplate({
    bannerAlt: "Contact Submission",
    common: messages.common,
    contentHtml
  })
}
