import { type Component } from "solid-js";
import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import GrandTaleHeader from "#components/franchises/grand-tale/GrandTaleHeader";

export const GrandTaleForumsPage: Component = () => {
  useHead(() =>
    createPageHead({
      title: "Grand Tale Forums",
      description: "Official community forums for Grand Tale",
    }),
  );

  return (
    <>
      <GrandTaleHeader />
      <div class="bg-grand-tale-primary-900 min-h-screen">
        <div class="max-w-7xl mx-auto px-4 py-16">
          <h1 class="text-4xl font-extrabold text-white">Grand Tale Forums</h1>
          <p class="text-neutral-400 mt-2">
            Explore guides, trade notes, form guilds, and discuss gameplay.
          </p>
        </div>
      </div>
    </>
  );
};

export default GrandTaleForumsPage;
