import { type Component } from "solid-js"
import BlankLayout from "#layouts/BlankLayout"
import { getLocale } from "@rimelight/i18n"
import { renderVerificationEmail } from "#auth/email/render"
import { createAsyncData } from "#utils/async"

export const VerificationEmailPreview: Component = () => {
  const locale = getLocale()
  const url = "http://localhost:4321/api/auth/verify-email?token=fake-token-123"

  const html = createAsyncData(
    () => locale,
    async (loc) => {
      return await renderVerificationEmail(url, loc)
    },
    ""
  )

  return (
    <BlankLayout title="Verify Email" description="Email preview">
      <div class="p-8 max-w-4xl mx-auto" innerHTML={html() || ""} />
    </BlankLayout>
  )
}

export default VerificationEmailPreview
