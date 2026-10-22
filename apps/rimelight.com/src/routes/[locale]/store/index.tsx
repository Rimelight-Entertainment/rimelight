import { type Component } from "solid-js";
import StoreLayout from "#layouts/StoreLayout";
import { t } from "@rimelight/i18n";

export const StoreIndexPage: Component = () => {
  return (
    <StoreLayout title={t("page.store.meta.title")} description={t("page.store.meta.description")}>
      <div class="py-12 px-4 max-w-7xl mx-auto">
        <h1 class="text-4xl font-extrabold text-white tracking-tight">
          {t("page.store.meta.title")}
        </h1>
        <p class="text-neutral-400 mt-2">{t("page.store.meta.description")}</p>
      </div>
    </StoreLayout>
  );
};

export default StoreIndexPage;
