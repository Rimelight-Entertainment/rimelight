import { type Component } from "solid-js";
import { t } from "@rimelight/i18n";

export const RimelightForumsPage: Component = () => {
  return (
    <div class="max-w-7xl mx-auto px-4 py-16">
      <h1 class="text-4xl font-extrabold text-white">{t("app.text.rimelight-forums")}</h1>
      <p class="text-neutral-400 mt-2">
        Join community discussions, share feedback, and connect with developers.
      </p>
    </div>
  );
};

export default RimelightForumsPage;
