import { Hono } from "hono"
import { sendVerificationEmail } from "@/auth/email/verification"
import { sendPasswordResetEmail } from "@/auth/email/password-reset"
import { sendExistingUserSignUpNotification } from "@/auth/email/notifications"

const api = new Hono()

// Base layout component for previews - with CLEAR email boundary indicators
function renderPreviewPage(title: string, html: string, notes?: string[]) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Email Preview</title>
  <style>
    body {
      background: #f5f5f7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    header {
      background: linear-gradient(135deg, #6d4aff, #8a6dff);
      color: white;
      padding: 24px;
      text-align: center;
    }
    header h1 {
      margin: 0;
      font-size: 20px;
    }

    /* PREVIEW ENVIRONMENT FRAME */
    .preview-frame {
      background: #fafafa;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      padding: 24px;
      margin: 24px 0;
      position: relative;
    }

    .preview-label {
      position: absolute;
      top: -12px;
      left: 16px;
      background: #d1d5db;
      color: #374151;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    /* ACTUAL EMAIL TEMPLATE BOUNDARY - THIS IS WHAT THE USER WILL SEE */
    .actual-email {
      background: white;
      border: 2px dashed #6d4aff;
      border-radius: 6px;
      padding: 24px;
      position: relative;
      box-shadow: 0 0 0 1px rgba(109, 74, 255, 0.1);
    }

    .email-boundary-label {
      position: absolute;
      top: -14px;
      right: 16px;
      background: #6d4aff;
      color: white;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }

    /* EMAIL CONTENT AREA (this goes INSIDE .actual-email) */
    .email-content {
      padding: 0;
      border: none;
    }

    .notes {
      margin-top: 24px;
      padding: 16px;
      background: #fffbea;
      border-left: 4px solid #fbbf24;
      border-radius: 4px;
    }
    .notes h3 {
      margin: 0 0 8px 0;
      color: #92400e;
    }
    .notes ul {
      margin: 0;
      padding-left: 20px;
      color: #78350f;
    }
    .back-link {
      display: block;
      text-align: center;
      margin-top: 24px;
      color: #666;
      text-decoration: none;
    }
    .back-link:hover {
      color: #6d4aff;
    }

    /* LEGEND - explains the visual indicators */
    .legend {
      display: flex;
      gap: 24px;
      justify-content: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      font-size: 12px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 2px;
    }
    .legend-gray {
      background: #d1d5db;
      border: 2px solid #d1d5db;
    }
    .legend-purple {
      border: 2px dashed #6d4aff;
      background: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📧 ${title}</h1>
    </header>

    <!-- PREVIEW FRAME (gray border = preview environment, not sent in email) -->
    <div class="preview-frame">
      <span class="preview-label">PREVIEW MODE</span>

      <!-- ACTUAL EMAIL (purple dashed border = what recipients receive) -->
      <div class="actual-email">
        <span class="email-boundary-label">EMAIL CONTENT</span>
        <div class="email-content">
          ${html}
        </div>
      </div>
    </div>

    ${notes ? `
    <div class="notes">
      <h3>📝 Notes</h3>
      <ul>
        ${notes.map(note => `<li>${note}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="legend">
      <div class="legend-item">
        <div class="legend-color legend-gray"></div>
        <span>Preview Environment</span>
      </div>
      <div class="legend-item">
        <div class="legend-color legend-purple"></div>
        <span>Sent in Email</span>
      </div>
    </div>
    <a href="/api/email/preview" class="back-link">← Back to preview index</a>
  </div>
</body>
</html>
  `
}

// Index: List all preview pages
api.get("/", (c) => {
  const links = [
    { path: "/api/email/preview/verification", title: "Verify Email" },
    { path: "/api/email/preview/password-reset", title: "Password Reset" },
    { path: "/api/email/preview/signup-notification", title: "Sign-up Notification" },
  ]

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Preview Index</title>
  <style>
    body {
      background: #f5f5f7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 40px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      color: #333;
      margin-bottom: 32px;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .card h2 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #333;
    }
    .card p {
      margin: 0 0 16px 0;
      color: #666;
    }
    .card a {
      display: inline-block;
      padding: 10px 20px;
      background: #6d4aff;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .card a:hover {
      background: #5a47cc;
    }
    .legend-index {
      display: flex;
      gap: 24px;
      justify-content: center;
      margin-top: 32px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      font-size: 12px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-icon {
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📧 Email Templates Preview</h1>
    ${links.map(link => `
    <div class="card">
      <h2>${link.title}</h2>
      <p>Preview the email template for ${link.title.toLowerCase()}</p>
      <a href="${link.path}">Open Preview</a>
    </div>
    `).join('')}

    <div class="legend-index">
      <div class="legend-item">
        <span class="legend-icon">🖼️</span>
        <span>Gray frame = Preview mode</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon">✉️</span>
        <span>Dashed purple = Actual email content</span>
      </div>
    </div>
  </div>
</body>
</html>
  `

  return c.html(html)
})

// Verification Email Preview
api.get("/verification", async (c) => {
  const mockData = {
    user: { email: "user@example.com" },
    url: "http://localhost:4321/api/auth/verify-email?token=fake-token-123",
    token: "fake-token-123",
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #333; font-size: 22px; margin-bottom: 16px;">Verify your email</h1>
      <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">Click the link below to verify your email address:</p>
      <a href="${mockData.url}" style="display: inline-block; padding: 14px 28px; background-color: #6d4aff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600;">
        Verify Email
      </a>
      <p style="color: #888; font-size: 13px; margin-top: 24px;">Or copy this link:</p>
      <p style="word-break: break-all; color: #9ca3af; font-size: 11px; font-family: monospace; background: #f3f4f6; padding: 8px; border-radius: 4px;">${mockData.url}</p>
    </div>
  `

  const notes = [
    "Token expires in 1 hour",
    "Only works for unverified users",
    "Redirects to callbackURL after verification",
  ]

  return c.html(renderPreviewPage("Verify Email", html, notes))
})

// Password Reset Email Preview
api.get("/password-reset", async (c) => {
  const mockData = {
    user: { email: "user@example.com" },
    url: "http://localhost:4321/auth/reset-password?token=fake-token-123",
    token: "fake-token-123",
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #333; font-size: 22px; margin-bottom: 16px;">Reset your password</h1>
      <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">Click the link below to reset your password:</p>
      <a href="${mockData.url}" style="display: inline-block; padding: 14px 28px; background-color: #6d4aff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600;">
        Reset Password
      </a>
      <p style="color: #888; font-size: 13px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">If you didn't request this, you can ignore this email.</p>
    </div>
  `

  const notes = [
    "Token expires in 1 hour",
    "Invalidates all other sessions",
    "Shows 'password changed' notification",
  ]

  return c.html(renderPreviewPage("Password Reset", html, notes))
})

// Sign-up Notification Preview
api.get("/signup-notification", async (c) => {
  const mockData = {
    user: { email: "user@example.com" },
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #dc2626; font-size: 22px; margin-bottom: 16px;">⚠️ Security Notice</h1>
      <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">Someone tried to create an account using your email address.</p>
      <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">If this was you, please <a href="http://localhost:4321/auth/sign-in" style="color: #6d4aff;">sign in</a> instead.</p>
      <p style="color: #888; font-size: 13px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">If not, you can safely ignore this email.</p>
    </div>
  `

  const notes = [
    "Sent when someone attempts to sign up with existing email",
    "No session created",
    "Helps detect unauthorized sign-up attempts",
  ]

  return c.html(renderPreviewPage("Sign-up Notification", html, notes))
})

export default api
