import { type Component } from "solid-js";
import StoreLayout from "#layouts/StoreLayout";
import { t } from "@rimelight/i18n";

export const StoreCategoryPage: Component = () => {
  return (
    <StoreLayout title={t("page_store.meta_title")} description={t("page_store.meta_description")}>
      <h1>{t("page_store.meta_title")}</h1>
      <p>{t("page_store.meta_description")}</p>
    </StoreLayout>
  );
};

export default StoreCategoryPage;
