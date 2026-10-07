import { type Component, createMemo } from "solid-js";
import BlankLayout from "#layouts/BlankLayout";
import { getCurrentLocale } from "@rimelight/i18n";
import { renderPasswordResetEmail } from "#auth/email/render";

export const PasswordResetEmailPreview: Component = () => {
  const locale = getCurrentLocale();
  const url = "http://localhost:4321/api/auth/reset-password?token=fake-token-123";

  const html = createMemo(
    async () => {
      return await renderPasswordResetEmail(url, locale);
    },
    { loadingValue: "" },
  );

  return (
    <BlankLayout title="Password Reset" description="Email preview">
      <div class="p-8 max-w-4xl mx-auto" innerHTML={html() || ""} />
    </BlankLayout>
  );
};

export default PasswordResetEmailPreview;
