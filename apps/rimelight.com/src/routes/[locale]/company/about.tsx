import { type Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { t, getRelativeLocaleUrl } from "@rimelight/i18n";

export const CompanyAboutPage: Component = () => {
  return (
    <AppLayout title={t("page_about.title")} description={t("page_about.description")}>
      <div class="flex flex-col gap-16 md:gap-24 pb-24 bg-neutral-950 text-white">
        {/* Hero Section */}
        <section class="flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 gap-6 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />
          <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl">
            {t("page_about.title")}
          </h1>
          <p class="text-lg md:text-xl text-neutral-400 max-w-2xl">{t("page_about.description")}</p>
        </section>

        {/* Mission & Vision */}
        <section class="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-white">Our Mission</h2>
            <p class="text-neutral-400 leading-relaxed">
              We craft memorable digital entertainment experiences with high player agency, rich
              social systems, and innovative open technology.
            </p>
          </div>
          <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-white">Our Values</h2>
            <p class="text-neutral-400 leading-relaxed">
              Creativity, player empathy, technological agility, and openness are at the core of
              everything we build.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section class="max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <h2 class="text-3xl font-bold text-white">Join Our Journey</h2>
          <p class="text-neutral-400">
            Want to work with us or learn more about our upcoming releases?
          </p>
          <div class="flex gap-4">
            <RLButton
              label="Explore Careers"
              href={getRelativeLocaleUrl("/company/careers")}
              color="primary"
              variant="solid"
            />
            <RLButton
              label="Get in Touch"
              href={getRelativeLocaleUrl("/company/contact")}
              color="neutral"
              variant="outline"
            />
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default CompanyAboutPage;
