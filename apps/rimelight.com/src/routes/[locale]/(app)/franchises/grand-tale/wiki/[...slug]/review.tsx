import { type Component } from "solid-js";
import { t } from "@rimelight/i18n";

export const WikiReviewPage: Component = () => {
  return (
    <div class="p-8 max-w-5xl mx-auto text-white">
      <h1 class="text-3xl font-bold mb-4">{t("app.text.review-revision")}</h1>
      <p class="text-neutral-400 mb-8">
        Inspect proposed edits before publishing to the live library.
      </p>
      <div class="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
        <p class="text-sm text-neutral-400">
          {t("app.text.no-revisions-pending-review-for-this-page")}
        </p>
      </div>
    </div>
  );
};

export default WikiReviewPage;
