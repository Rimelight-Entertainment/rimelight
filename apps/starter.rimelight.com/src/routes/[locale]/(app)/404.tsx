import { type Component } from "solid-js";
import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { RLError } from "@rimelight/ui";
import { t } from "@rimelight/i18n";

export const Page404: Component = () => {
  useHead(() =>
    createPageHead({
      title: t("errors.not-found") || "Page Not Found",
      description: t("errors.not-found-desc") || "The page you are looking for does not exist.",
      is404: true,
    }),
  );

  return <RLError status={404} />;
};

export default Page404;
