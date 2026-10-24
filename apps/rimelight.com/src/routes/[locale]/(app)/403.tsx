import { type Component } from "solid-js";
import AppError from "#components/app/AppError";
import { t } from "@rimelight/i18n";

export const Error403Page: Component = () => {
  return (
    <AppError
      code={403}
      title={t("page.error.forbidden.title") || "Access Forbidden"}
      description={
        t("page.error.forbidden.description") ||
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
