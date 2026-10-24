import { type Component, createSignal, onSettled } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import AppError from "#components/app/AppError";
import { authClient } from "@rimelight/auth/client";

export const Page403: Component = () => {
  const [userEmail, setUserEmail] = createSignal("");
  onSettled(() => {
    void authClient
      .getMe()
      .then((user) => {
        if (user?.email) setUserEmail(user.email);
      })
      .catch(() => {});
  });

  useHead(() =>
    createSeoHead({
      title: "403 - Access Denied",
      description:
        "Your account does not have administrator privileges required to access this page.",
    }),
  );

  return (
    <AppError
      code={403}
      title="Access Denied"
      description="Your account does not have administrator privileges required to access this page."
      userEmail={userEmail()}
      requiredRole="admin"
      actions={[
        {
          label: "Go to Home Page",
          href: "/",
          variant: "solid",
          color: "primary",
          icon: "home",
        },
      ]}
    />
  );
};

export default Page403;
