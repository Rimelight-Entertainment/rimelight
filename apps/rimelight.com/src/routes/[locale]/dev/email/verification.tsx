import { type Component, createMemo } from "solid-js";
import BlankLayout from "#layouts/BlankLayout";
import { getCurrentLocale } from "@rimelight/i18n";
import { renderVerificationEmail } from "#auth/email/render";

export const VerificationEmailPreview: Component = () => {
  const locale = getCurrentLocale();
  const url = "http://localhost:4321/api/auth/verify-email?token=fake-token-123";

  const html = createMemo(
    async () => {
      return await renderVerificationEmail(url, locale);
    },
    { loadingValue: "" },
  );

  return (
    <BlankLayout title="Verify Email" description="Email preview">
      <div class="p-8 max-w-4xl mx-auto" innerHTML={html() || ""} />
    </BlankLayout>
  );
};

export default VerificationEmailPreview;
