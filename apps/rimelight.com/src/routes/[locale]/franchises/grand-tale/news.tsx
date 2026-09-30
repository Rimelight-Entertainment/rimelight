import { type Component } from "solid-js";
import GrandTaleLayout from "#layouts/GrandTaleLayout";

export const GrandTaleNewsPage: Component = () => {
  return (
    <GrandTaleLayout
      title="Grand Tale News"
      description="Latest announcements and patch notes for Grand Tale"
    >
      <div class="max-w-5xl mx-auto px-4 py-20">
        <h1 class="text-4xl font-extrabold text-white uppercase tracking-tight mb-4">
          Grand Tale News
        </h1>
        <p class="text-neutral-400">Read development updates, patch notes, and community events.</p>
      </div>
    </GrandTaleLayout>
  );
};

export default GrandTaleNewsPage;
