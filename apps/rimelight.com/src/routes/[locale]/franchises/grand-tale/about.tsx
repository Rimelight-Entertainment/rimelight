import { type Component } from "solid-js";
import GrandTaleLayout from "#layouts/GrandTaleLayout";
import { RLAccordion } from "@rimelight/ui/components/accordion/RLAccordion.tsx";

const faqItems = [
  {
    label: "What is Grand Tale?",
    content:
      "Grand Tale is a high-fantasy social life-sim RPG hosting sub-games of multiple genres."
  },
  {
    label: "When is the game launching?",
    content:
      "We are currently running private alpha trials. Full details will be shared on our forums."
  },
  {
    label: "What platforms will be supported?",
    content: "Grand Tale is coming to PC, Mac, and mobile platforms with full cross-play."
  },
  {
    label: "Is Grand Tale free to play?",
    content:
      "Grand Tale is free to download and play, with cosmetic and community-driven customizations."
  }
];

export const GrandTaleAboutPage: Component = () => {
  return (
    <GrandTaleLayout title="About Grand Tale" description="Learn all about the world of Grand Tale">
      <div class="max-w-4xl mx-auto px-4 py-20">
        <h1 class="text-5xl font-black text-white uppercase tracking-tight mb-6">
          About Grand Tale
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
    </GrandTaleLayout>
  );
};

export default GrandTaleAboutPage;
