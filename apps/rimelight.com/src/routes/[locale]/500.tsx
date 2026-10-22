import { type Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import AppError from "#components/app/AppError";
import { t } from "@rimelight/i18n";

interface Props {
  error?: unknown;
}

export const Error500Page: Component<Props> = (props) => {
  return (
    <AppLayout
      title={t("page.error.server.title") || "Internal Server Error"}
      description={
        t("page.error.server.description") || "An unexpected error occurred on the server."
      }
      noindex={true}
    >
      <AppError
        code={500}
        title={t("page.error.server.title") || "Internal Server Error"}
        description={
          props.error instanceof Error
            ? props.error.message
            : t("page.error.unknown.description") || "An unexpected error occurred on the server."
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

export default Error500Page;
