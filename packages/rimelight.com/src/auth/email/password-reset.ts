import { sendEmail } from "."

export interface PasswordResetEmailOptions {
  user: { email: string }
  url: string
  token: string
}

export async function sendPasswordResetEmail({ user, url }: PasswordResetEmailOptions) {
  const subject = "Reset your password"

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Reset your password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #6d4aff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
        Reset Password
      </a>
      <p style="color: #666; font-size: 14px;">If you didn't request this, you can ignore this email.</p>
    </div>
  `

  return sendEmail({
    to: user.email,
    subject,
    text: `Click the link to reset your password: ${url}`,
    html,
  })
}
