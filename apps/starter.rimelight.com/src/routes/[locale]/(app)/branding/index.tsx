import { type Component } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { t } from "@rimelight/i18n";

export const BrandingPage: Component = () => {
  useHead(() =>
    createSeoHead({
      title: t("branding.title"),
      description: t("branding.description"),
    }),
  );

  return null;
};

export default BrandingPage;
