import { createSeoHead } from "@rimelight/seo/head";
import { useHead } from "@solidjs/web";
import { type Component } from "solid-js";
import AppError from "#components/app/AppError";

export const Error401Page: Component = () => {
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
            icon: "i-lucide-home",
          },
        ]}
      />
    
  );
};

export default Error401Page;
