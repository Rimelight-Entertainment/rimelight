import { type Component } from "solid-js"
import GuidesLayout from "#layouts/GuidesLayout"
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx"
import { t, getRelativeLocaleUrl } from "@rimelight/i18n"

export const GuidesIndexPage: Component = () => {
  return (
    <GuidesLayout
      title={t("page_grand-tale_guides.title") || "Grand Tale Guides"}
      description={t("page_grand-tale_guides.description") || "Community guides and walkthroughs"}
    >
      <div class="py-24 bg-neutral-950 text-white min-h-screen">
        <div class="max-w-6xl mx-auto px-4 space-y-16">
          <section class="space-y-6 max-w-4xl">
            <h1 class="text-5xl font-black uppercase tracking-tight">Grand Tale Guides</h1>
            <p class="text-xl text-neutral-400">
              Master every system in Aethelgard with curated player guides, build planners, and
              calculators.
            </p>
          </section>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
              <h2 class="text-2xl font-bold">Build Planners</h2>
              <p class="text-neutral-400 text-sm">
                Experiment with skill trees, gear loadouts, and soulstone sockets.
              </p>
              <RLButton
                label="Open Build Planner"
                href={getRelativeLocaleUrl("/franchises/grand-tale/guides/build-planners")}
                color="primary"
                variant="solid"
              />
            </div>
            <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
              <h2 class="text-2xl font-bold">Calculators</h2>
              <p class="text-neutral-400 text-sm">
                Calculate crafting yields, damage scaling, and progression paths.
              </p>
              <RLButton
                label="Open Calculators"
                href={getRelativeLocaleUrl("/franchises/grand-tale/guides/calculators")}
                color="primary"
                variant="solid"
              />
            </div>
          </div>
        </div>
      </div>
    </GuidesLayout>
  )
}

export default GuidesIndexPage
