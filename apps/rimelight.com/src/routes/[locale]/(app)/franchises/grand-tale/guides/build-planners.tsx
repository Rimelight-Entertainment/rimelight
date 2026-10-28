import { type Component } from "solid-js";
import { t } from "@rimelight/i18n";

export const BuildPlannersPage: Component = () => {
  return (
    <div class="py-16 max-w-6xl mx-auto px-4 text-white">
      <h1 class="text-4xl font-extrabold uppercase tracking-tight mb-4">
        {t("app.text.build-planners")}
      </h1>
      <p class="text-neutral-400 mb-8">
        Plan your hero builds, allocate mastery points, and share loadout links.
      </p>
      <div class="p-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-500">
        Build planner interface coming soon in Alpha 2.
      </div>
    </div>
  );
};

export default BuildPlannersPage;
