import { type Component } from "solid-js";
import { t } from "@rimelight/i18n";

export const GrandTaleSupportPage: Component = () => {
  return (
    <div class="max-w-4xl mx-auto px-4 py-20">
      <h1 class="text-4xl font-extrabold text-white uppercase tracking-tight mb-4">
        Grand Tale Support
      </h1>
      <p class="text-neutral-400">
        {t("app.text.search-troubleshooting-guides-or-submit-a-suppor")}
      </p>
    </div>
  );
};

export default GrandTaleSupportPage;
