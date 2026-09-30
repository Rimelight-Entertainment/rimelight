import { type Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { t } from "@rimelight/i18n";

export const BrandingPage: Component = () => {
  return <AppLayout title={t("branding.title")} description={t("branding.description")} />;
};

export default BrandingPage;
