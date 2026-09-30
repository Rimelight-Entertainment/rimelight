import { type Component } from "solid-js";
import BlankLayout from "#layouts/BlankLayout";
import { getLocale } from "@rimelight/i18n";
import { renderSignupNotificationEmail } from "#auth/email/render";
import { createAsyncData } from "#utils/async";

export const SignupNotificationEmailPreview: Component = () => {
  const locale = getLocale();
  const url = "http://localhost:4321/api/auth/login";

  const html = createAsyncData(
    () => locale,
    async (loc) => {
      return await renderSignupNotificationEmail(url, loc);
    },
    ""
  );

  return (
    <BlankLayout title="Sign-up Notification" description="Email preview">
      <div class="p-8 max-w-4xl mx-auto" innerHTML={html() || ""} />
    </BlankLayout>
  );
};

export default SignupNotificationEmailPreview;
