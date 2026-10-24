import { createSeoHead } from "@rimelight/seo/head";
import { useHead } from "@solidjs/web";
import { type Component } from "solid-js";

export const GrandTaleNewsPage: Component = () => {
  return (
    
      <div class="max-w-5xl mx-auto px-4 py-20">
        <h1 class="text-4xl font-extrabold text-white uppercase tracking-tight mb-4">
          Grand Tale News
        </h1>
        <p class="text-neutral-400">Read development updates, patch notes, and community events.</p>
      </div>
    
  );
};

export default GrandTaleNewsPage;
