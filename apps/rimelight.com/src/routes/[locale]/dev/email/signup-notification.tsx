import { type Component, createMemo } from "solid-js";
import BlankLayout from "#layouts/BlankLayout";
import { getLocale } from "@rimelight/i18n";
import { renderSignupNotificationEmail } from "#auth/email/render";

export const SignupNotificationEmailPreview: Component = () => {
  const locale = getLocale();
  const url = "http://localhost:4321/api/auth/login";

  const html = createMemo(
    async () => {
      return await renderSignupNotificationEmail(url, locale);
    },
    { loadingValue: "" },
  );

  return (
    <BlankLayout title="Sign-up Notification" description="Email preview">
      <div class="p-8 max-w-4xl mx-auto" innerHTML={html() || ""} />
    </BlankLayout>
  );
};

export default SignupNotificationEmailPreview;
