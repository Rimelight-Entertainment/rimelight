import { type Component } from "solid-js";
import BlankLayout from "#layouts/BlankLayout";
import { RLLocaleSelector, RLThemeSelector } from "@rimelight/ui";
import { getCurrentLocale, getLocaleUrl } from "@rimelight/i18n";

export const DebugComponentPage: Component = () => {
  const locales = () => [
    { code: "en", label: "English", href: getLocaleUrl("/en") },
    { code: "pt", label: "Português", href: getLocaleUrl("/pt") },
  ];

  return (
    <BlankLayout title="Component Debug">
      <div class="p-8 flex flex-col gap-6">
        <div class="text-sm">getCurrentLocale(): {getCurrentLocale()}</div>

        <div class="flex flex-col gap-2">
          <h2 class="font-semibold">RLLocaleSelector WITHOUT currentLocale (as-is in footer)</h2>
          <RLLocaleSelector locales={locales()} class="min-w-44" />
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="font-semibold">RLLocaleSelector WITH currentLocale={getCurrentLocale()}</h2>
          <RLLocaleSelector
            locales={locales()}
            currentLocale={getCurrentLocale()}
            class="min-w-44"
          />
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="font-semibold">RLThemeSelector</h2>
          <RLThemeSelector class="min-w-44" />
        </div>
      </div>
    </BlankLayout>
  );
};

export default DebugComponentPage;
