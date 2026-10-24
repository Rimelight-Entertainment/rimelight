import { type Component, createEffect } from "solid-js";
import { useLocation } from "@solidjs/router";

export const SignInPage: Component = () => {
  const location = useLocation();
  createEffect(
    () => location.search,
    (search) => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(search);
        const returnTo = params.get("returnTo");
        const target = returnTo
          ? `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`
          : "/api/auth/login";
        window.location.href = target;
      }
    },
  );
  return (
    <div class="flex items-center justify-center min-h-screen">
      <p class="text-muted text-sm">Redirecting to sign in...</p>
    </div>
  );
};

export default SignInPage;
