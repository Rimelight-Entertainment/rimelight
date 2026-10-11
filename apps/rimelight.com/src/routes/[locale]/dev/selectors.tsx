import { type Component } from "solid-js";
import DevLayout from "#layouts/DevLayout";
import { RLLocaleSelector, RLThemeSelector } from "@rimelight/ui";
import { getCurrentLocale, getLocaleUrl } from "@rimelight/i18n";

export const DevSelectorsPage: Component = () => {
  const locales = () => [
    { code: "en", label: "English", href: getLocaleUrl("/en") },
    { code: "pt", label: "Português", href: getLocaleUrl("/pt") },
    { code: "es", label: "Español", href: getLocaleUrl("/es") },
  ];

  return (
    <DevLayout
      title="Selector Controls Debugger"
      description="Isolated testing of RLLocaleSelector and RLThemeSelector components"
      currentSection="selectors"
      maxWidth="2xl"
    >
      <div class="flex flex-col gap-6">
        <div class="border-b border-default pb-4">
          <h1 class="text-2xl font-bold text-highlighted">Selector Controls Diagnostics</h1>
          <p class="text-xs text-muted mt-1">
            Testing RLLocaleSelector and RLThemeSelector under isolated rendering conditions.
          </p>
        </div>

        <div class="p-3 rounded-lg border border-default bg-elevated/20 text-xs font-mono">
          <span class="text-muted">getCurrentLocale():</span>{" "}
          <span class="font-bold text-primary">{getCurrentLocale()}</span>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
            RLLocaleSelector WITHOUT explicit currentLocale
          </h2>
          <div class="p-4 border border-default rounded-xl bg-elevated/20">
            <RLLocaleSelector locales={locales()} class="min-w-44" />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
            RLLocaleSelector WITH explicit currentLocale={getCurrentLocale()}
          </h2>
          <div class="p-4 border border-default rounded-xl bg-elevated/20">
            <RLLocaleSelector
              locales={locales()}
              currentLocale={getCurrentLocale()}
              class="min-w-44"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="text-xs font-mono font-bold text-muted uppercase tracking-wider">
            RLThemeSelector
          </h2>
          <div class="p-4 border border-default rounded-xl bg-elevated/20">
            <RLThemeSelector class="min-w-44" />
          </div>
        </div>
      </div>
    </DevLayout>
  );
};

export default DevSelectorsPage;
