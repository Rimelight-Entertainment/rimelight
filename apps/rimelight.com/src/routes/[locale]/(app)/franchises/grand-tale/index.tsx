import { type Component } from "solid-js";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLVideo } from "@rimelight/ui/components/video/RLVideo.tsx";
import { t, getLocaleUrl } from "@rimelight/i18n";
import type { RLButtonProps } from "@rimelight/ui/components/button/button.types.ts";

export const GrandTaleIndexPage: Component = () => {
  const heroLinks = (): RLButtonProps[] => [
    {
      label: t("page.franchises.grand.tale.home.hero.button"),
      href: getLocaleUrl("/franchises/grand-tale/download"),
      color: "primary",
      variant: "solid",
      class:
        "px-8 py-4 text-xl font-bold bg-primary-500 hover:bg-primary-600 rounded-md transition-all uppercase",
    },
  ];

  const overviewLinks = (): RLButtonProps[] => [
    {
      label: t("page.franchises.grand.tale.home.overview.button"),
      href: getLocaleUrl("/franchises/grand-tale/about"),
      color: "primary",
      variant: "solid",
      class:
        "px-6 py-3 rounded-md font-bold transition-all text-white bg-primary-500 hover:bg-primary-600",
    },
  ];

  return (
    <>
      <RLPageSection
        variant="hero"
        title={t("page.franchises.grand.tale.home.sections.hero.title")}
        description={t("page.franchises.grand.tale.home.sections.hero.description")}
        links={heroLinks()}
        ui={{
          title: "text-white text-5xl lg:text-7xl font-black uppercase tracking-tight",
          description: "text-neutral-300 max-w-2xl text-lg md:text-xl",
        }}
        backgroundSlot={
          <div class="w-full h-full">
            <video autoplay loop muted playsinline class="h-full w-full object-cover opacity-60">
              <source
                src="https://cdn.rimelight.com/videos/grandTale_home_hero_bg.mp4"
                type="video/mp4"
              />
            </video>
            <div class="absolute inset-0 bg-black/40" />
          </div>
        }
      />

      <RLPageSection
        orientation="horizontal"
        title={t("page.franchises.grand.tale.home.sections.overview.title")}
        description={t("page.franchises.grand.tale.home.sections.overview.description")}
        links={overviewLinks()}
        ui={{
          title: "text-white text-4xl font-extrabold uppercase",
          description: "text-neutral-400",
        }}
        bodySlot={
          <div class="grid grid-cols-2 gap-8 mt-8 max-w-xl">
            <div>
              <div class="text-4xl font-black text-white">3+</div>
              <div class="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">
                Unique Realms
              </div>
            </div>
            <div>
              <div class="text-4xl font-black text-white">100+</div>
              <div class="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">
                Abilities to Master
              </div>
            </div>
          </div>
        }
      >
        <div class="flex items-center justify-center lg:pl-12 w-full mt-10 lg:mt-0">
          <RLVideo
            src="https://www.youtube.com/watch?v=QdXl3QtutQI"
            title={t("app.text.grand-tale-official-trailer")}
            class="aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-800 shadow-2xl"
          />
        </div>
      </RLPageSection>

      <section class="py-24 bg-black border-t border-neutral-900">
        <div class="max-w-6xl mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 shadow-lg hover:border-primary-500/50 transition-colors">
              <h3 class="text-xl font-bold text-white uppercase mb-4">
                {t("page.franchises.grand.tale.home.features.tactical-combat.title")}
              </h3>
              <p class="text-neutral-400 text-sm leading-relaxed">
                {t("page.franchises.grand.tale.home.features.tactical-combat.description")}
              </p>
            </div>
            <div class="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 shadow-lg hover:border-primary-500/50 transition-colors">
              <h3 class="text-xl font-bold text-white uppercase mb-4">
                {t("page.franchises.grand.tale.home.features.living-world.title")}
              </h3>
              <p class="text-neutral-400 text-sm leading-relaxed">
                {t("page.franchises.grand.tale.home.features.living-world.description")}
              </p>
            </div>
            <div class="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 shadow-lg hover:border-primary-500/50 transition-colors">
              <h3 class="text-xl font-bold text-white uppercase mb-4">
                {t("page.franchises.grand.tale.home.features.deep-economy.title")}
              </h3>
              <p class="text-neutral-400 text-sm leading-relaxed">
                {t("page.franchises.grand.tale.home.features.deep-economy.description")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default GrandTaleIndexPage;
