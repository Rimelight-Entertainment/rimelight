import { type Component } from "solid-js";
import GrandTaleLayout from "#layouts/GrandTaleLayout";

export const GrandTaleForumsPage: Component = () => {
  return (
    <GrandTaleLayout
      title="Grand Tale Forums"
      description="Official community forums for Grand Tale"
    >
      <div class="max-w-7xl mx-auto px-4 py-16">
        <h1 class="text-4xl font-extrabold text-white">Grand Tale Forums</h1>
        <p class="text-neutral-400 mt-2">
          Explore guides, trade notes, form guilds, and discuss gameplay.
        </p>
      </div>
    </GrandTaleLayout>
  );
};

export default GrandTaleForumsPage;
