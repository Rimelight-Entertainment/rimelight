import { createSeoHead } from "@rimelight/seo/head";
import { useHead } from "@solidjs/web";
import { type Component } from "solid-js";
import { t } from "@rimelight/i18n";

export const BrandingPage: Component = () => {
  return (
    
      <div class="max-w-7xl mx-auto px-4 py-16">
        <h1 class="text-4xl font-extrabold text-white tracking-tight">
          {t("page.branding.meta.title")}
        </h1>
        <p class="text-neutral-400 mt-4 text-lg">{t("branding.description")}</p>
      </div>
    
  );
};

export default BrandingPage;
