import { type Component } from "solid-js";
import GuidesLayout from "#layouts/GuidesLayout";

export const BuildPlannersPage: Component = () => {
  return (
    <GuidesLayout
      title="Build Planners | Grand Tale"
      description="Character talent and build configuration tool"
    >
      <div class="py-16 max-w-6xl mx-auto px-4 text-white">
        <h1 class="text-4xl font-extrabold uppercase tracking-tight mb-4">Build Planners</h1>
        <p class="text-neutral-400 mb-8">
          Plan your hero builds, allocate mastery points, and share loadout links.
        </p>
        <div class="p-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-500">
          Build planner interface coming soon in Alpha 2.
        </div>
      </div>
    </GuidesLayout>
  );
};

export default BuildPlannersPage;
