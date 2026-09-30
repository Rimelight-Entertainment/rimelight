import { type Component } from "solid-js";
import GrandTaleLayout from "#layouts/GrandTaleLayout";

export const GrandTaleDownloadPage: Component = () => {
  return (
    <GrandTaleLayout
      title="Download Grand Tale"
      description="Download the Grand Tale game launcher and client"
    >
      <div class="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 class="text-5xl font-black text-white uppercase tracking-tight mb-4">
          Download Grand Tale
        </h1>
        <p class="text-neutral-400 text-lg">
          Launcher downloads will be made available to alpha and beta participants.
        </p>
      </div>
    </GrandTaleLayout>
  );
};

export default GrandTaleDownloadPage;
