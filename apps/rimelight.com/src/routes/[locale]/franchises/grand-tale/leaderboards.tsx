import { type Component } from "solid-js";
import GrandTaleLayout from "#layouts/GrandTaleLayout";

export const GrandTaleLeaderboardsPage: Component = () => {
  return (
    <GrandTaleLayout
      title="Grand Tale Leaderboards"
      description="Seasonal rankings and player leaderboards"
    >
      <div class="max-w-5xl mx-auto px-4 py-20">
        <h1 class="text-4xl font-extrabold text-white uppercase tracking-tight mb-4">
          Leaderboards
        </h1>
        <p class="text-neutral-400">
          Check out seasonal top performers across arena battles, dungeon runs, and guild
          challenges.
        </p>
      </div>
    </GrandTaleLayout>
  );
};

export default GrandTaleLeaderboardsPage;
