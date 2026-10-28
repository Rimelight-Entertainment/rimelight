import { type Component } from "solid-js";
import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { t } from "@rimelight/i18n";

export const BrandingPage: Component = () => {
  useHead(() =>
    createPageHead({
      title: t("page.branding.meta.title"),
      description: t("page.branding.meta.description"),
    }),
  );

  return null;
};

export default BrandingPage;
