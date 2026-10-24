import { createSeoHead } from "@rimelight/seo/head";
import { useHead } from "@solidjs/web";
import { type Component } from "solid-js";

export const WikiContributionGuidePage: Component = () => {
  return (
    
      <article class="prose dark:prose-invert max-w-4xl mx-auto py-8">
        <h1 class="text-4xl font-extrabold uppercase text-white mb-6">
          Wiki Contribution Guidelines
        </h1>
        <p class="text-lg text-neutral-300 leading-relaxed mb-6">
          Help build and maintain the Great Library of Aethelgard. Follow formatting standards and
          citation requirements when contributing new entries.
        </p>
      </article>
    
  );
};

export default WikiContributionGuidePage;
