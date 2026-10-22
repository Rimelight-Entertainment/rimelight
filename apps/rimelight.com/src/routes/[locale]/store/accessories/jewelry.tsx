import { type Component } from "solid-js";
import StoreLayout from "#layouts/StoreLayout";
import { t } from "@rimelight/i18n";

export const StoreCategoryPage: Component = () => {
  return (
    <StoreLayout title={t("page.store.meta.title")} description={t("page.store.meta.description")}>
      <h1>{t("page.store.meta.title")}</h1>
      <p>{t("page.store.meta.description")}</p>
    </StoreLayout>
  );
};

export default StoreCategoryPage;
