import { type Component } from "solid-js";
import AppError from "#components/app/AppError";
import { t } from "@rimelight/i18n";

export const Error404Page: Component = () => {
  return (
    <AppError
      code={404}
      title={t("page.error.not-found.title") || "Page Not Found"}
      description={
        t("page.error.not-found.description") ||
        "The page you are looking for does not exist or has been moved."
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

export default Error404Page;
