import DevLayout from "#layouts/DevLayout";
import { For, Show } from "solid-js";
import { type JSX } from "@solidjs/web";
import { useLocation } from "@solidjs/router";
import {
  getCurrentLocale,
  getDefaultLocale,
  getLocaleAsset,
  getLocaleUrl,
  getLocales,
  t,
} from "@rimelight/i18n";
import { RLButton, RLLocaleSelector } from "@rimelight/ui";

type TranslationFunction = (params?: Record<string, unknown>) => string;

// Translation dictionaries ship as JSON, so function values can't live in them.
// Re-run the resolver inside a scoped store to exercise runtime.ts function values.
const withComputedTranslation = <R,>(fn: TranslationFunction, callback: () => R): R => {
  const storage = globalThis.__rimelight_i18n;
  const store = storage?.getStore();
  if (!storage || !store) return callback();
  return storage.run(
    {
      ...store,
      translations: {
        ...store.translations,
        dev_localization: {
          ...(store.translations?.["dev_localization"] as Record<string, unknown> | undefined),
          sample_computed: fn,
        },
      },
    },
    callback,
  );
};

export default function DevLocalizationPage() {
  const location = useLocation();
  const EXPLICIT_LOCALE = "pt";
  const LOCALE_ASSETS = { en: "🇬🇧 English", pt: "🇧🇷 Português" };

  const sections = (): {
    title: string;
    mono?: boolean;
    rows: {
      label?: string;
      mono?: boolean;
      code?: string;
      description?: string;
      value?: string;
      content?: JSX.Element;
    }[];
  }[] => [
    {
      title: t("dev_localization.current_values"),
      rows: [
        {
          label: t("dev_localization.current_locale"),
          code: `getCurrentLocale()`,
          value: getCurrentLocale(),
        },
        {
          label: t("dev_localization.window_pathname"),
          code: `location.pathname`,
          value: location.pathname,
        },
        {
          label: t("dev_localization.available_locales"),
          code: `getLocales()`,
          value: JSON.stringify(getLocales()),
        },
      ],
    },
    {
      title: "getLocales()",
      mono: true,
      rows: [
        {
          label: "Locale selector",
          code: `getLocales()`,
          content: <RLLocaleSelector locales={getLocales()} currentLocale={getCurrentLocale()} />,
        },
      ],
    },
    {
      title: "getDefaultLocale()",
      mono: true,
      rows: [
        {
          label: t("dev_localization.default_locale_title"),
          code: `getDefaultLocale()`,
          description: t("dev_localization.default_locale_description"),
          value: getDefaultLocale(),
        },
      ],
    },
    {
      title: "getLocaleUrl()",
      mono: true,
      rows: getLocales().map((code) => ({
        label: code,
        mono: true,
        code: `getLocaleUrl("${location.pathname}", "${code}")`,
        // rel="external" opts out of client-side routing: with no translations
        // on the client, switching locale needs a full reload so the server
        // re-renders in the new locale.
        content: (
          <RLButton
            variant="soft"
            color="neutral"
            href={getLocaleUrl(location.pathname, code)}
            label={t("dev_localization.goto_locale", { locale: code })}
            rel="external"
          />
        ),
      })),
    },
    {
      title: "getLocaleAsset()",
      mono: true,
      rows: [
        {
          label: t("dev_localization.locale_asset_title"),
          code: `getLocaleAsset({ en: "🇬🇧 English", pt: "🇧🇷 Português" })\ngetLocaleAsset({ en: "🇬🇧 English", pt: "🇧🇷 Português" }, "es")`,
          description: t("dev_localization.locale_asset_description"),
          value: `${getCurrentLocale()}: ${getLocaleAsset(LOCALE_ASSETS)}\nes: ${getLocaleAsset(
            LOCALE_ASSETS,
            "es",
          )}`,
        },
      ],
    },
    {
      title: "t()",
      mono: true,
      rows: [
        {
          label: t("dev_localization.t_basic_title"),
          code: `t("dev_localization.sample_hello")`,
          description: t("dev_localization.t_basic_description"),
          value: t("dev_localization.sample_hello"),
        },
        {
          label: t("dev_localization.t_interpolation_title"),
          code: `t("dev_localization.sample_greeting", { name: "Ada" })`,
          description: t("dev_localization.t_interpolation_description"),
          value: t("dev_localization.sample_greeting", { name: "Ada" }),
        },
        {
          label: t("dev_localization.t_count_title"),
          code: `t("dev_localization.sample_items", { count: 1 })\nt("dev_localization.sample_items", { count: 1234 })`,
          description: t("dev_localization.t_count_description"),
          value: `${t("dev_localization.sample_items", { count: 1 })}\n${t("dev_localization.sample_items", { count: 1234 })}`,
        },
        {
          label: t("dev_localization.t_count_branch_title"),
          code: `t("dev_localization.sample_other_only", { count: 1 })`,
          description: t("dev_localization.t_count_branch_description"),
          value: t("dev_localization.sample_other_only", { count: 1 }),
        },
        {
          label: t("dev_localization.t_function_title"),
          code: `t("dev_localization.sample_computed", { value: 21 })`,
          description: t("dev_localization.t_function_description"),
          value: withComputedTranslation(
            (params) => `Computed: ${Number(params?.["value"] ?? 0) * 2}`,
            () => t("dev_localization.sample_computed", { value: 21 }),
          ),
        },
        {
          label: t("dev_localization.t_locale_title"),
          code: `t("dev_localization.sample_hello", undefined, "${EXPLICIT_LOCALE}")`,
          description: t("dev_localization.t_locale_description"),
          value: `${getCurrentLocale()}: ${t("dev_localization.sample_hello")}\n${EXPLICIT_LOCALE}: ${t(
            "dev_localization.sample_hello",
            undefined,
            EXPLICIT_LOCALE,
          )}`,
        },
        {
          label: t("dev_localization.t_raw_title"),
          code: `t.raw("dev_localization.sample_object")`,
          description: t("dev_localization.t_raw_description"),
          value: JSON.stringify(t.raw("dev_localization.sample_object") ?? null),
        },
        {
          label: t("dev_localization.t_raw_locale_title"),
          code: `t.raw("dev_localization.sample_hello", undefined, "${EXPLICIT_LOCALE}")`,
          description: t("dev_localization.t_raw_locale_description"),
          value: String(t.raw("dev_localization.sample_hello", undefined, EXPLICIT_LOCALE) ?? null),
        },
        {
          label: t("dev_localization.t_raw_fallback_title"),
          code: `t.raw("dev_localization.missing_key", "fallback value")`,
          description: t("dev_localization.t_raw_fallback_description"),
          value: String(t.raw("dev_localization.missing_key", "fallback value")),
        },
        {
          label: t("dev_localization.t_array_title"),
          code: `t.array("dev_localization.sample_tags")`,
          description: t("dev_localization.t_array_description"),
          value: JSON.stringify(t.array("dev_localization.sample_tags") ?? []),
        },
        {
          label: t("dev_localization.t_array_fallback_title"),
          code: `t.array("dev_localization.missing_key", ["Fallback", "Items"])`,
          description: t("dev_localization.t_array_fallback_description"),
          value: JSON.stringify(t.array("dev_localization.missing_key", ["Fallback", "Items"])),
        },
        {
          label: t("dev_localization.t_plural_title"),
          code: `t.plural(1)\nt.plural(5)\nt.plural(2, "${EXPLICIT_LOCALE}")`,
          description: t("dev_localization.t_plural_description"),
          value: `1: ${t.plural(1)}\n5: ${t.plural(5)}\n2 (${EXPLICIT_LOCALE}): ${t.plural(2, EXPLICIT_LOCALE)}`,
        },
        {
          label: t("dev_localization.t_localize_title"),
          code: `t.localize({ en: "English", pt: "Português", es: "Español" })`,
          description: t("dev_localization.t_localize_description"),
          value: `${getCurrentLocale()}: ${t.localize({ en: "English", pt: "Português", es: "Español" })}\nes: ${t.localize(
            { en: "English", pt: "Português", es: "Español" },
            "es",
          )}`,
        },
        {
          label: t("dev_localization.t_missing_title"),
          code: `t("dev_localization.does_not_exist")`,
          description: t("dev_localization.t_missing_description"),
          value: t("dev_localization.does_not_exist"),
        },
      ],
    },
  ];

  return (
    <DevLayout>
      <div class="flex flex-col gap-2xl">
        <header class="flex flex-col gap-xs">
          <h1 class="text-3xl text-highlighted">{t("dev_localization.title")}</h1>
          <p class="text-sm text-muted">{t("dev_localization.description")}</p>
        </header>

        <For each={sections()}>
          {(section) => (
            <section class="bg-elevated/20">
              <header class="bg-elevated/40 px-xl py-sm">
                <h2 class="text-xs text-muted">
                  {section.mono ? <code>{section.title}</code> : section.title}
                </h2>
              </header>
              <hr class="border-default" />
              <div class="flex flex-col">
                <For each={section.rows}>
                  {(row, index) => (
                    <>
                      <Show when={index() > 0}>
                        <hr class="border-default" />
                      </Show>
                      <div class="flex items-start gap-xl px-xl py-md">
                        <div class="flex min-w-0 flex-1 flex-col gap-xs">
                          <Show when={row.label}>
                            {row.mono ? (
                              <code class="text-sm text-highlighted">{row.label}</code>
                            ) : (
                              <span class="text-sm text-highlighted">{row.label}</span>
                            )}
                          </Show>
                          <Show when={row.code}>
                            <pre class="whitespace-pre-wrap break-words text-xs text-muted">
                              {row.code}
                            </pre>
                          </Show>
                          <Show when={row.description}>
                            <p class="text-xs text-muted">{row.description}</p>
                          </Show>
                        </div>
                        <div class="min-w-0 text-sm text-highlighted">
                          <Show when={row.value}>
                            <pre class="whitespace-pre-wrap break-words">{row.value}</pre>
                          </Show>
                          {row.content}
                        </div>
                      </div>
                    </>
                  )}
                </For>
              </div>
            </section>
          )}
        </For>
      </div>
    </DevLayout>
  );
}
