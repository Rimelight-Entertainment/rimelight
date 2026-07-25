// src/auth/email/notifications.ts

import { sendEmail } from "."

export async function sendExistingUserSignUpNotification({ user }: { user: { email: string } }) {
  const subject = "Sign-up attempt with your email"

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Security Notice</h1>
      <p>Someone tried to create an account using your email address.</p>
      <p>If this was you, please <a href="/auth/sign-in">sign in</a> instead.</p>
      <p style="color: #666; font-size: 14px;">If not, you can safely ignore this email.</p>
    </div>
  `

  return sendEmail({
    to: user.email,
    subject,
    text: "Someone tried to create an account using your email address. If this was you, try signing in instead.",
    html,
  })
}
