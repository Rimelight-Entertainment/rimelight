import { type Component, createEffect } from "solid-js";
import { t } from "@rimelight/i18n";

export const SignOutPage: Component = () => {
  createEffect(
    () => true,
    () => {
      if (typeof window !== "undefined") {
        window.location.href = "/api/auth/logout";
      }
    },
  );
  return (
    <div class="flex items-center justify-center min-h-screen">
      <p class="text-muted text-sm">{t("app.text.redirecting-to-sign-out")}</p>
    </div>
  );
};

export default SignOutPage;
