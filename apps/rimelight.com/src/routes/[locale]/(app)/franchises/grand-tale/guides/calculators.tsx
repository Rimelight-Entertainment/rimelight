import { createSeoHead } from "@rimelight/seo/head";
import { useHead } from "@solidjs/web";
import { type Component } from "solid-js";

export const CalculatorsPage: Component = () => {
  return (
    
      <div class="py-16 max-w-6xl mx-auto px-4 text-white">
        <h1 class="text-4xl font-extrabold uppercase tracking-tight mb-4">Mechanics Calculators</h1>
        <p class="text-neutral-400 mb-8">
          Compute soulstone crafting rates, combat scaling, and XP milestones.
        </p>
        <div class="p-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-500">
          Calculators interface coming soon in Alpha 2.
        </div>
      </div>
    
  );
};

export default CalculatorsPage;
