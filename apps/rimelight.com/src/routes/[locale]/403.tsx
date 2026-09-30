import { type Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import AppError from "#components/app/AppError";
import { t } from "@rimelight/i18n";

export const Error403Page: Component = () => {
  return (
    <AppLayout
      title={t("page_error.error_forbidden_title") || "Access Forbidden"}
      description={
        t("page_error.error_forbidden_description") ||
        "You do not have permission to access this resource."
      }
      noindex={true}
    >
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
    </AppLayout>
  );
};

export default Error403Page;
