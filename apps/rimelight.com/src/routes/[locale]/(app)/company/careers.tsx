import { type Component } from "solid-js";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { t } from "@rimelight/i18n";

export const CareersPage: Component = () => {
  return (
    <div class="flex flex-col gap-16 md:gap-24 pb-24 bg-neutral-950 text-white">
      {/* Hero Section */}
      <section class="flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 gap-6 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl">
          {t("page.company.careers.title")}
        </h1>
        <p class="text-lg md:text-xl text-neutral-400 max-w-2xl">
          {t("page.company.careers.description")}
        </p>
      </section>

      {/* Perks Grid */}
      <section class="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
          <h3 class="text-lg font-bold text-white mb-2">{t("app.text.remote-first")}</h3>
          <p class="text-neutral-400 text-sm">
            Work from anywhere in the world with flexible hours and modern tooling.
          </p>
        </div>
        <div class="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
          <h3 class="text-lg font-bold text-white mb-2">{t("app.text.creative-autonomy")}</h3>
          <p class="text-neutral-400 text-sm">
            Take true ownership of your features, architecture, and artistic direction.
          </p>
        </div>
        <div class="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
          <h3 class="text-lg font-bold text-white mb-2">
            {t("app.text.competitive-compensation")}
          </h3>
          <p class="text-neutral-400 text-sm">
            Top-tier pay, equity participation, and generous equipment stipends.
          </p>
        </div>
      </section>

      {/* Open Positions */}
      <section class="max-w-4xl mx-auto px-4 w-full flex flex-col gap-6">
        <h2 class="text-3xl font-bold text-white text-center">{t("app.text.open-positions")}</h2>
        <div class="flex flex-col gap-4">
          <div class="p-6 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
            <div>
              <h3 class="font-bold text-lg text-white">
                {t("app.text.senior-game-engine-developer")}
              </h3>
              <p class="text-sm text-neutral-400">{t("app.text.engineering-remote")}</p>
            </div>
            <RLButton
              label="Apply"
              href="mailto:careers@rimelight.com"
              color="primary"
              variant="solid"
            />
          </div>
          <div class="p-6 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
            <div>
              <h3 class="font-bold text-lg text-white">
                {t("app.text.full-stack-cloud-systems-engineer")}
              </h3>
              <p class="text-sm text-neutral-400">{t("app.text.platform-remote")}</p>
            </div>
            <RLButton
              label="Apply"
              href="mailto:careers@rimelight.com"
              color="primary"
              variant="solid"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareersPage;
