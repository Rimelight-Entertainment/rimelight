import { createSeoHead } from "@rimelight/seo/head";
import { useHead } from "@solidjs/web";
import { type Component } from "solid-js";
import AppError from "#components/app/AppError";
import { t } from "@rimelight/i18n";

export const Error403Page: Component = () => {
  return (
    
      <AppError
        code={403}
        title={t("page_error.error_forbidden_title") || "Access Forbidden"}
        description={
          t("page_error.error_forbidden_description") ||
          "You do not have permission to view this page."
        }
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

export default Error403Page;
