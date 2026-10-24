import { type Component } from "solid-js";
import { t } from "@rimelight/i18n";

export const StoreCategoryPage: Component = () => {
  return (
    <>
      <h1>{t("page.store.meta.title")}</h1>
      <p>{t("page.store.meta.description")}</p>
    </>
  );
};

export default StoreCategoryPage;
