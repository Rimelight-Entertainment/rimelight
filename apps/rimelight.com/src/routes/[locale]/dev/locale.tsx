import { type Component, For } from "solid-js";
import { useLocation } from "@solidjs/router";
import DevLayout from "#layouts/DevLayout";
import { getCurrentLocale, getLocaleUrl, getLocales, t } from "@rimelight/i18n";
import { RLButton, RLLocaleSelector } from "@rimelight/ui";

export const DevLocalePage: Component = () => {
  return (
    <DevLayout>
      <div class="flex flex-col gap-md">
        <div class="border-b border-default pb-6">
          <h1 class="text-3xl font-bold tracking-tight text-highlighted">Localization</h1>
          <p class="text-sm text-muted mt-2">
            Validating i18n URL rewriting, router params, and RLLocaleSelector reactive sync.
          </p>
        </div>

        {/* Current Values */}
        <div class="p-4 bg-muted flex flex-col gap-2">
          <h2>Current Values</h2>
          <div class="flex justify-between">
            <span class="text-muted">Current Locale:</span>
            <span class="font-bold">{getCurrentLocale()}</span>
          </div>
          <hr class="border-neutral" />
          <div class="flex justify-between">
            <span class="text-muted">Window Pathname:</span>
            <span class="font-bold">{useLocation().pathname}</span>
          </div>
          <hr class="border-neutral" />
          <div class="flex justify-between">
            <span class="text-muted">Available Locales:</span>
            <span class="font-bold">{JSON.stringify(getLocales())}</span>
          </div>
          <hr class="border-neutral" />
          <div class="flex justify-between">
            <span class="text-muted">Sample Translation:</span>
            <span class="font-bold">{t("page_home.meta_title")}</span>
          </div>
        </div>

        {/* getLocales() */}
        <div class="p-4 bg-muted flex flex-col gap-2">
          <h2>
            <code>getLocales()</code>
          </h2>
          <RLLocaleSelector locales={getLocales()} currentLocale={getCurrentLocale()} />
        </div>

        {/* getLocaleUrl */}
        <div class="p-4 bg-muted flex flex-col gap-2">
          <h2>
            <code>getLocaleUrl()</code>
          </h2>
          <div class="flex flex-wrap gap-sm">
            <For each={getLocales()}>
              {(code) => (
                <RLButton
                  variant="soft"
                  color="neutral"
                  href={getLocaleUrl(useLocation().pathname, code)}
                  label={`Go to /${code}`}
                />
              )}
            </For>
          </div>
        </div>
      </div>
    </DevLayout>
  );
};

export default DevLocalePage;
