import { type Component } from "solid-js";
import { t } from "@rimelight/i18n";

export const CulturePage: Component = () => {
  return (
    <div class="max-w-7xl mx-auto px-4 py-16">
      <h1 class="text-4xl font-extrabold text-white">{t("app.text.life-culture-at-rimelight")}</h1>
      <p class="text-neutral-400 mt-4 text-lg">
        Autonomy, craftsmanship, inclusivity, and passion for excellence.
      </p>
    </div>
  );
};

export default CulturePage;
