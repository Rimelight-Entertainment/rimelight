import { type Component } from "solid-js";
import { t } from "@rimelight/i18n";

export const CompanyIndexPage: Component = () => {
  return (
    <div class="max-w-7xl mx-auto px-4 py-16">
      <h1 class="text-4xl font-extrabold text-white">{t("app.text.rimelight-entertainment")}</h1>
      <p class="text-neutral-400 mt-4 text-lg">
        Creating worlds, interactive entertainment, and open technologies.
      </p>
    </div>
  );
};

export default CompanyIndexPage;
