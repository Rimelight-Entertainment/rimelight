import { type Component } from "solid-js";
import { RLAccordion } from "@rimelight/ui/components/accordion/RLAccordion.tsx";
import { t } from "@rimelight/i18n";

export const GrandTaleAboutPage: Component = () => {
  const faqItems = [
    {
      label: t("app.text.what-is-grand-tale"),
      content:
        "Grand Tale is a high-fantasy social life-sim RPG hosting sub-games of multiple genres.",
    },
    {
      label: t("app.text.when-is-the-game-launching"),
      content:
        "We are currently running private alpha trials. Full details will be shared on our forums.",
    },
    {
      label: t("app.text.what-platforms-will-be-supported"),
      content: "Grand Tale is coming to PC, Mac, and mobile platforms with full cross-play.",
    },
    {
      label: t("app.text.is-grand-tale-free-to-play"),
      content:
        "Grand Tale is free to download and play, with cosmetic and community-driven customizations.",
    },
  ];
  return (
    <div class="max-w-4xl mx-auto px-4 py-20">
      <h1 class="text-5xl font-black text-white uppercase tracking-tight mb-6">
        {t("app.text.about-grand-tale")}
      </h1>
      <p class="text-xl text-neutral-300 leading-relaxed mb-12">
        Grand Tale combines deep roleplaying mechanics with rich player-driven housing, crafting,
        combat, and social interactions across seamless fantasy realms.
      </p>

      <h2 class="text-2xl font-bold text-white uppercase tracking-wider mb-6">
        Frequently Asked Questions
      </h2>
      <RLAccordion items={faqItems} />
    </div>
  );
};

export default GrandTaleAboutPage;
