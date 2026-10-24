import { createSeoHead } from "@rimelight/seo/head";
import { useHead } from "@solidjs/web";
import { type Component, For } from "solid-js";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLCard } from "@rimelight/ui/components/card/RLCard.tsx";
import { getLocaleUrl } from "@rimelight/i18n";

const quickNavItems = [
  {
    title: "Getting Started",
    description: "New to Grand Tale? Start here to learn the basics.",
    href: "/franchises/grand-tale/wiki/getting-started",
    icon: "i-lucide-book-open",
  },
  {
    title: "Characters",
    description: "Explore the heroes, villains, and legends of the world.",
    href: "/franchises/grand-tale/wiki/lore/characters",
    icon: "i-lucide-users",
  },
  {
    title: "Locations",
    description: "Discover the regions, cities, and landmarks.",
    href: "/franchises/grand-tale/wiki/lore/locations",
    icon: "i-lucide-map-pin",
  },
  {
    title: "Heroes",
    description: "Master the playable heroes and their abilities.",
    href: "/franchises/grand-tale/wiki/lore/heroes",
    icon: "i-lucide-shield-check",
  },
];

const trendingArticles = [
  {
    title: "Chronicles of the Cataclysm",
    category: "Lore",
    summary: "A deep dive into the cataclysmic events that reshaped Aethelgard.",
  },
  {
    title: "Soulstone Resonance Mechanics",
    category: "Guides",
    summary: "How to maximize your character's combat efficiency using Soulstone resonance.",
  },
  {
    title: "The Nine Factions Overview",
    category: "Lore",
    summary: "Learn about the origins, motives, and leaders of the Nine Factions.",
  },
  {
    title: "Elemental Weakness & Rotations",
    category: "Strategy",
    summary: "Mastering elemental synergy to defeat raid bosses.",
  },
];

export const WikiIndexPage: Component = () => {
  return (
    
      <div class="space-y-16">
        <section class="space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-full">
            Wiki Home
          </div>
          <h1 class="text-5xl font-black uppercase tracking-tighter text-white leading-none">
            The Great Library <br />
            of <span class="text-indigo-400">Aethelgard</span>
          </h1>
          <p class="text-xl text-neutral-300 font-light max-w-2xl leading-relaxed">
            Welcome to the central knowledge hub of Grand Tale. Here you will find detailed
            documentation on everything from the smallest shards of Soulstone to legendary figures.
          </p>

          <div class="flex flex-col md:flex-row gap-6 items-start lg:items-center pt-2">
            <div class="bg-neutral-900/60 border border-neutral-800 p-4 flex gap-3 w-full max-w-xl rounded-2xl shadow-inner">
              <RLInput
                placeholder="Search the library..."
                size="lg"
                class="flex-1"
                color="neutral"
              />
              <RLButton color="primary" label="Search" class="px-6 rounded-xl" />
            </div>

            <div class="flex gap-12 px-4">
              <div>
                <div class="text-3xl font-black text-white leading-none">128</div>
                <div class="text-xs text-indigo-400 uppercase font-black tracking-widest mt-1">
                  Articles
                </div>
              </div>
              <div>
                <div class="text-3xl font-black text-white leading-none">52</div>
                <div class="text-xs text-indigo-400 uppercase font-black tracking-widest mt-1">
                  Contributors
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr class="border-neutral-800/40" />

        <section class="space-y-8">
          <h2 class="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <span class="i-lucide-compass text-indigo-400 size-6" />
            Quick Navigation
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <For each={quickNavItems}>
              {(item) => (
                <a href={getLocaleUrl(item.href)} class="group block no-underline">
                  <RLCard class="bg-neutral-900/40 border-neutral-800 hover:bg-neutral-850 hover:border-indigo-500/50 transition-all h-full rounded-2xl p-6">
                    <div class="flex items-start gap-4">
                      <div class="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 shrink-0">
                        <span class={`${item.icon} size-6 text-indigo-400`} />
                      </div>
                      <div class="space-y-1 flex-1">
                        <h3 class="text-lg font-bold text-white group-hover:text-indigo-400 uppercase transition-colors">
                          {item.title}
                        </h3>
                        <p class="text-sm text-neutral-400 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </RLCard>
                </a>
              )}
            </For>
          </div>
        </section>

        <section class="space-y-8">
          <h2 class="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <span class="i-lucide-flame text-indigo-400 size-6" />
            Trending Articles
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <For each={trendingArticles}>
              {(article) => (
                <div class="p-6 bg-neutral-900/40 border border-neutral-800 hover:bg-neutral-850 hover:border-indigo-500/50 transition-all flex flex-col items-start gap-3 rounded-2xl">
                  <div class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    {article.category}
                  </div>
                  <div class="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {article.title}
                  </div>
                  <div class="text-xs text-neutral-400 text-left line-clamp-2 leading-relaxed">
                    {article.summary}
                  </div>
                </div>
              )}
            </For>
          </div>
        </section>
      </div>
    
  );
};

export default WikiIndexPage;
