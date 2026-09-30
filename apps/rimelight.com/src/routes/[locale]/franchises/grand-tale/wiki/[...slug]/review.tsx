import { type Component } from "solid-js";
import DashboardLayout from "#layouts/DashboardLayout";

export const WikiReviewPage: Component = () => {
  return (
    <DashboardLayout title="Review Wiki Revision">
      <div class="p-8 max-w-5xl mx-auto text-white">
        <h1 class="text-3xl font-bold mb-4">Review Revision</h1>
        <p class="text-neutral-400 mb-8">
          Inspect proposed edits before publishing to the live library.
        </p>
        <div class="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
          <p class="text-sm text-neutral-400">No revisions pending review for this page.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WikiReviewPage;
