import { type Component, createEffect } from "solid-js";
import { useLocation } from "@solidjs/router";
import { t } from "@rimelight/i18n";

export const SignUpPage: Component = () => {
  const location = useLocation();
  createEffect(
    () => location.search,
    (search) => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(search);
        const returnTo = params.get("returnTo");
        const target = returnTo
          ? `/api/auth/register?returnTo=${encodeURIComponent(returnTo)}`
          : "/api/auth/register";
        window.location.href = target;
      }
    },
  );
  return (
    <div class="flex items-center justify-center min-h-screen">
      <p class="text-muted text-sm">{t("app.text.redirecting-to-sign-up")}</p>
    </div>
  );
};

export default SignUpPage;
