import { For } from "solid-js";
import { useLocation } from "@solidjs/router";
import DevLayout from "#layouts/DevLayout";
import { getCurrentLocale, getLocaleUrl, getLocales, t } from "@rimelight/i18n";
import { RLButton, RLLocaleSelector } from "@rimelight/ui";

const EXPLICIT_LOCALE = "pt";

export default function DevLocalizationPage() {
  const location = useLocation();

  return (
    <DevLayout>
      <div class="flex flex-col gap-md">
        <div class="flex flex-col gap-sm">
          <h1 class="text-3xl font-bold text-highlighted">{t("dev_locale.title")}</h1>
          <p class="text-sm text-muted">{t("dev_locale.description")}</p>
          <hr class="border-neutral" />
        </div>

        {/* Current Values */}
        <div class="p-4 bg-muted flex flex-col gap-sm">
          <h2>{t("dev_locale.current_values")}</h2>
          <div class="flex justify-between">
            <span class="text-muted">{t("dev_locale.current_locale")}:</span>
            <span class="font-bold">{getCurrentLocale()}</span>
          </div>
          <hr class="border-neutral" />
          <div class="flex justify-between">
            <span class="text-muted">{t("dev_locale.window_pathname")}:</span>
            <span class="font-bold">{location.pathname}</span>
          </div>
          <hr class="border-neutral" />
          <div class="flex justify-between">
            <span class="text-muted">{t("dev_locale.available_locales")}:</span>
            <span class="font-bold">{JSON.stringify(getLocales())}</span>
          </div>
        </div>

        {/* getLocales() */}
        <div class="p-4 bg-muted flex flex-col gap-sm">
          <h2>
            <code>getLocales()</code>
          </h2>
          <RLLocaleSelector locales={getLocales()} currentLocale={getCurrentLocale()} />
        </div>

        {/* getLocaleUrl */}
        <div class="p-4 bg-muted flex flex-col gap-sm">
          <h2>
            <code>getLocaleUrl()</code>
          </h2>
          <div class="flex flex-wrap gap-sm">
            <For each={getLocales()}>
              {(code) => (
                // rel="external" opts out of client-side routing: with no
                // translations on the client, switching locale needs a full
                // reload so the server re-renders in the new locale.
                <RLButton
                  variant="soft"
                  color="neutral"
                  href={getLocaleUrl(location.pathname, code)}
                  label={t("dev_locale.goto_locale", { locale: code })}
                  rel="external"
                />
              )}
            </For>
          </div>
        </div>

        {/* t() */}
        <div class="p-4 bg-muted flex flex-col gap-md">
          <h2>
            <code>t()</code>
          </h2>

          {/* Basic key */}
          <div class="flex flex-col gap-1 border-t border-neutral pt-3 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-bold">{t("dev_locale.t_basic_title")}</span>
              <code class="text-xs text-muted whitespace-pre-wrap">{`t("dev_locale.sample_hello")`}</code>
            </div>
            <p class="text-xs text-muted">{t("dev_locale.t_basic_description")}</p>
            <div class="font-mono text-sm text-highlighted break-words">
              {t("dev_locale.sample_hello")}
            </div>
          </div>

          {/* Interpolation */}
          <div class="flex flex-col gap-1 border-t border-neutral pt-3 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-bold">{t("dev_locale.t_interpolation_title")}</span>
              <code class="text-xs text-muted whitespace-pre-wrap">{`t("dev_locale.sample_greeting", { name: "Ada" })`}</code>
            </div>
            <p class="text-xs text-muted">{t("dev_locale.t_interpolation_description")}</p>
            <div class="font-mono text-sm text-highlighted break-words">
              {t("dev_locale.sample_greeting", { name: "Ada" })}
            </div>
          </div>

          {/* Count */}
          <div class="flex flex-col gap-1 border-t border-neutral pt-3 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-bold">{t("dev_locale.t_count_title")}</span>
              <code class="text-xs text-muted whitespace-pre-wrap">{`t("dev_locale.sample_items", { count: 1 })\nt("dev_locale.sample_items", { count: 1234 })`}</code>
            </div>
            <p class="text-xs text-muted">{t("dev_locale.t_count_description")}</p>
            <div class="font-mono text-sm text-highlighted break-words flex flex-col">
              <span>{t("dev_locale.sample_items", { count: 1 })}</span>
              <span>{t("dev_locale.sample_items", { count: 1234 })}</span>
            </div>
          </div>

          {/* Explicit locale */}
          <div class="flex flex-col gap-1 border-t border-neutral pt-3 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-bold">{t("dev_locale.t_locale_title")}</span>
              <code class="text-xs text-muted whitespace-pre-wrap">{`t("dev_locale.sample_hello", undefined, "${EXPLICIT_LOCALE}")`}</code>
            </div>
            <p class="text-xs text-muted">{t("dev_locale.t_locale_description")}</p>
            <div class="font-mono text-sm text-highlighted break-words flex flex-col">
              <span>{`${getCurrentLocale()}: ${t("dev_locale.sample_hello")}`}</span>
              <span>
                {`${EXPLICIT_LOCALE}: ${t("dev_locale.sample_hello", undefined, EXPLICIT_LOCALE)}`}
              </span>
            </div>
          </div>

          {/* t.raw() object */}
          <div class="flex flex-col gap-1 border-t border-neutral pt-3 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-bold">{t("dev_locale.t_raw_title")}</span>
              <code class="text-xs text-muted whitespace-pre-wrap">{`t.raw("dev_locale.sample_object")`}</code>
            </div>
            <p class="text-xs text-muted">{t("dev_locale.t_raw_description")}</p>
            <div class="font-mono text-sm text-highlighted break-words">
              {JSON.stringify(t.raw("dev_locale.sample_object") ?? null)}
            </div>
          </div>

          {/* t.raw() fallback */}
          <div class="flex flex-col gap-1 border-t border-neutral pt-3 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-bold">{t("dev_locale.t_raw_fallback_title")}</span>
              <code class="text-xs text-muted whitespace-pre-wrap">{`t.raw("dev_locale.missing_key", "fallback value")`}</code>
            </div>
            <p class="text-xs text-muted">{t("dev_locale.t_raw_fallback_description")}</p>
            <div class="font-mono text-sm text-highlighted break-words">
              {t.raw("dev_locale.missing_key", "fallback value")}
            </div>
          </div>

          {/* t.array() */}
          <div class="flex flex-col gap-1 border-t border-neutral pt-3 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-bold">{t("dev_locale.t_array_title")}</span>
              <code class="text-xs text-muted whitespace-pre-wrap">{`t.array("dev_locale.sample_tags")`}</code>
            </div>
            <p class="text-xs text-muted">{t("dev_locale.t_array_description")}</p>
            <div class="font-mono text-sm text-highlighted break-words">
              {JSON.stringify(t.array("dev_locale.sample_tags") ?? [])}
            </div>
          </div>

          {/* t.plural() */}
          <div class="flex flex-col gap-1 border-t border-neutral pt-3 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-bold">{t("dev_locale.t_plural_title")}</span>
              <code class="text-xs text-muted whitespace-pre-wrap">{`t.plural(1)\nt.plural(5)\nt.plural(2, "${EXPLICIT_LOCALE}")`}</code>
            </div>
            <p class="text-xs text-muted">{t("dev_locale.t_plural_description")}</p>
            <div class="font-mono text-sm text-highlighted break-words flex flex-col">
              <span>{`1: ${t.plural(1)}`}</span>
              <span>{`5: ${t.plural(5)}`}</span>
              <span>{`2 (${EXPLICIT_LOCALE}): ${t.plural(2, EXPLICIT_LOCALE)}`}</span>
            </div>
          </div>

          {/* t.localize() */}
          <div class="flex flex-col gap-1 border-t border-neutral pt-3 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-bold">{t("dev_locale.t_localize_title")}</span>
              <code class="text-xs text-muted whitespace-pre-wrap">{`t.localize({ en: "English", pt: "Português", es: "Español" })`}</code>
            </div>
            <p class="text-xs text-muted">{t("dev_locale.t_localize_description")}</p>
            <div class="font-mono text-sm text-highlighted break-words flex flex-col">
              <span>
                {`${getCurrentLocale()}: ${t.localize({ en: "English", pt: "Português", es: "Español" })}`}
              </span>
              <span>
                {`es: ${t.localize({ en: "English", pt: "Português", es: "Español" }, "es")}`}
              </span>
            </div>
          </div>

          {/* Missing key */}
          <div class="flex flex-col gap-1 border-t border-neutral pt-3 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-bold">{t("dev_locale.t_missing_title")}</span>
              <code class="text-xs text-muted whitespace-pre-wrap">{`t("dev_locale.does_not_exist")`}</code>
            </div>
            <p class="text-xs text-muted">{t("dev_locale.t_missing_description")}</p>
            <div class="font-mono text-sm text-highlighted break-words">
              {t("dev_locale.does_not_exist")}
            </div>
          </div>
        </div>
      </div>
    </DevLayout>
  );
}
