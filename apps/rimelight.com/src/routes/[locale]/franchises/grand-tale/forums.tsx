import { type Component } from "solid-js";
import GrandTaleLayout from "#layouts/GrandTaleLayout";

export const GrandTaleForumsRedirectPage: Component = () => {
  return (
    <GrandTaleLayout title="Grand Tale Community" description="Official Grand Tale community hub">
      <div class="max-w-4xl mx-auto px-4 py-20">
        <h1 class="text-4xl font-extrabold text-white uppercase tracking-tight mb-4">
          Community Hub
        </h1>
        <p class="text-neutral-400">
          Join our Discord and community forums to participate in discussions.
        </p>
      </div>
    </GrandTaleLayout>
  );
};

export default GrandTaleForumsRedirectPage;
