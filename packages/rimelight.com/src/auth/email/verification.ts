import { sendEmail } from "."

export interface VerificationEmailOptions {
  user: { email: string }
  url: string
  token: string
}

export async function sendVerificationEmail({ user, url }: VerificationEmailOptions) {
  const subject = "Verify your email address"

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Verify your email</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #6d4aff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
        Verify Email
      </a>
      <p style="color: #666; font-size: 14px;">Or copy this link:</p>
      <p style="word-break: break-all; color: #999; font-size: 12px;">${url}</p>
    </div>
  `

  return sendEmail({
    to: user.email,
    subject,
    text: `Click the link to verify your email: ${url}`,
    html,
  })
}
