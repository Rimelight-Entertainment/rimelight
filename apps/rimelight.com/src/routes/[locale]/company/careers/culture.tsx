import { type Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";

export const CulturePage: Component = () => {
  return (
    <AppLayout title="Our Culture" description="Life and culture at Rimelight Entertainment">
      <div class="max-w-7xl mx-auto px-4 py-16">
        <h1 class="text-4xl font-extrabold text-white">Life & Culture at Rimelight</h1>
        <p class="text-neutral-400 mt-4 text-lg">
          Autonomy, craftsmanship, inclusivity, and passion for excellence.
        </p>
      </div>
    </AppLayout>
  );
};

export default CulturePage;
