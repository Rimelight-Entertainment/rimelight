import { type Component } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import AppError from "#components/app/AppError";

export const Page401: Component = () => {
  useHead(() =>
    createSeoHead({
      title: "401 - Authentication Required",
      description: "You must be signed in to access this page.",
    }),
  );

  return (
    <AppError
      code={401}
      title="Authentication Required"
      description="You must be signed in to access this page."
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

export default Page401;
