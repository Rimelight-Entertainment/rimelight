import { type Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { t } from "@rimelight/i18n";

export const BrandingPage: Component = () => {
  return (
    <AppLayout title={t("page.branding.meta.title")} description={t("branding.description")}>
      <div class="max-w-7xl mx-auto px-4 py-16">
        <h1 class="text-4xl font-extrabold text-white tracking-tight">
          {t("page.branding.meta.title")}
        </h1>
        <p class="text-neutral-400 mt-4 text-lg">{t("branding.description")}</p>
      </div>
    </AppLayout>
  );
};

export default BrandingPage;
