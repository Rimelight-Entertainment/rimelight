import { type Component } from "solid-js"
import BlankLayout from "#layouts/BlankLayout"
import { getLocale } from "@rimelight/i18n"
import { renderPasswordResetEmail } from "#auth/email/render"
import { createAsyncData } from "#utils/async"

export const PasswordResetEmailPreview: Component = () => {
  const locale = getLocale()
  const url = "http://localhost:4321/api/auth/reset-password?token=fake-token-123"

  const html = createAsyncData(
    () => locale,
    async (loc) => {
      return await renderPasswordResetEmail(url, loc)
    },
    ""
  )

  return (
    <BlankLayout title="Password Reset" description="Email preview">
      <div class="p-8 max-w-4xl mx-auto" innerHTML={html() || ""} />
    </BlankLayout>
  )
}

export default PasswordResetEmailPreview
