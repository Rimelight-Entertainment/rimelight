import { type Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import AppError from "#components/app/AppError";
import { t } from "@rimelight/i18n";

export const Page404: Component = () => {
  return (
    <AppLayout
      title={t("errors.notFound") || "Page Not Found"}
      description={t("errors.notFoundDesc") || "The page you are looking for does not exist."}
    >
      <AppError
        code={404}
        title={t("errors.notFound") || "Page Not Found"}
        description={
          t("errors.notFoundDesc") ||
          "The page you are looking for does not exist or has been moved."
        }
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
    </AppLayout>
  );
};

export default Page404;
