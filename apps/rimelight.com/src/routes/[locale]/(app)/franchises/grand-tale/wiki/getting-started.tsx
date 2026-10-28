import { type Component } from "solid-js";
import { t } from "@rimelight/i18n";

export const WikiGettingStartedPage: Component = () => {
  return (
    <article class="prose dark:prose-invert max-w-4xl mx-auto py-8">
      <h1 class="text-4xl font-extrabold uppercase text-white mb-6">
        Getting Started with Grand Tale
      </h1>
      <p class="text-lg text-neutral-300 leading-relaxed mb-6">
        Welcome adventurer! This guide covers creating your initial avatar, selecting starting
        skills, and venturing into the world of Aethelgard.
      </p>
      <h2 class="text-2xl font-bold text-white mt-8 mb-4">{t("app.text.1-choosing-your-path")}</h2>
      <p class="text-neutral-400">
        Grand Tale features classless character progression. Pick introductory proficiencies that
        align with your playstyle.
      </p>
    </article>
  );
};

export default WikiGettingStartedPage;
