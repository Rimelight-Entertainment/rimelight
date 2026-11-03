import { For, Loading, Show, createMemo } from "solid-js";
import { type JSX } from "@solidjs/web";
import { useLocation } from "@solidjs/router";
import {
  getCurrentLocale,
  getDefaultLocale,
  getLocaleAsset,
  getLocaleUrl,
  getLocales,
  loadLocale,
  t,
} from "@rimelight/i18n";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLLocaleSelector } from "@rimelight/ui/components/locale-selector/RLLocaleSelector.tsx";

const withComputedTranslation = (
  fn: (params?: Record<string, unknown>) => string,
  params?: Record<string, unknown>,
) => fn(params);

export default function DevLocalizationPage() {
  return (
    <Loading fallback={<main>{t("app.text.loading")}</main>}>
      <Localization />
    </Loading>
  );
}

function Localization() {
  const location = useLocation();
  const EXPLICIT_LOCALE = "pt";
  // t() is synchronous and this page reads `pt` by name, so wait for it before rendering.
  createMemo(() => loadLocale(EXPLICIT_LOCALE))();
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
      title: t("page.dev.localization.current.values"),
      rows: [
        {
          label: t("page.dev.localization.current.locale"),
          code: `getCurrentLocale()`,
          value: getCurrentLocale(),
        },
        {
          label: t("page.dev.localization.window.pathname"),
          code: `location.pathname`,
          value: location.pathname,
        },
        {
          label: t("page.dev.localization.available.locales"),
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
          label: t("app.text.locale-selector"),
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
          label: t("page.dev.localization.default.locale.title"),
          code: `getDefaultLocale()`,
          description: t("page.dev.localization.default.locale.description"),
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
            label={t("page.dev.localization.goto.locale", { locale: code })}
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
          label: t("page.dev.localization.locale.asset.title"),
          code: `getLocaleAsset({ en: "🇬🇧 English", pt: "🇧🇷 Português" })\ngetLocaleAsset({ en: "🇬🇧 English", pt: "🇧🇷 Português" }, "es")`,
          description: t("page.dev.localization.locale.asset.description"),
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
          label: t("page.dev.localization.t.basic.title"),
          code: `t("page.dev.localization.sample.hello")`,
          description: t("page.dev.localization.t.basic.description"),
          value: t("page.dev.localization.sample.hello"),
        },
        {
          label: t("page.dev.localization.t.interpolation.title"),
          code: `t("page.dev.localization.sample.greeting", { name: "Ada" })`,
          description: t("page.dev.localization.t.interpolation.description"),
          value: t("page.dev.localization.sample.greeting", { name: "Ada" }),
        },
        {
          label: t("page.dev.localization.t.count.title"),
          code: `t("page.dev.localization.sample.items", { count: 1 })\nt("page.dev.localization.sample.items", { count: 1234 })`,
          description: t("page.dev.localization.t.count.description"),
          value: `${t("page.dev.localization.sample.items", { count: 1 })}\n${t("page.dev.localization.sample.items", { count: 1234 })}`,
        },
        {
          label: t("page.dev.localization.t.count.branch.title"),
          code: `t("page.dev.localization.sample.other.only", { count: 1 })`,
          description: t("page.dev.localization.t.count.branch.description"),
          value: t("page.dev.localization.sample.other.only", { count: 1 }),
        },
        {
          label: t("page.dev.localization.t.function.title"),
          code: `t("page.dev.localization.sample.computed", { value: 21 })`,
          description: t("page.dev.localization.t.function.description"),
          value: withComputedTranslation(
            (params) => `Computed: ${Number(params?.["value"] ?? 0) * 2}`,
            { value: 21 },
          ),
        },
        {
          label: t("page.dev.localization.t.locale.title"),
          code: `t("page.dev.localization.sample.hello", undefined, "${EXPLICIT_LOCALE}")`,
          description: t("page.dev.localization.t.locale.description"),
          value: `${getCurrentLocale()}: ${t("page.dev.localization.sample.hello")}\n${EXPLICIT_LOCALE}: ${t(
            "page.dev.localization.sample.hello",
            undefined,
            EXPLICIT_LOCALE,
          )}`,
        },
        {
          label: t("page.dev.localization.t.raw.title"),
          code: `t.raw("page.dev.localization.sample.object")`,
          description: t("page.dev.localization.t.raw.description"),
          value: JSON.stringify(t.raw("page.dev.localization.sample.object") ?? null),
        },
        {
          label: t("page.dev.localization.t.raw.locale.title"),
          code: `t.raw("page.dev.localization.sample.hello", undefined, "${EXPLICIT_LOCALE}")`,
          description: t("page.dev.localization.t.raw.locale.description"),
          value: String(
            t.raw("page.dev.localization.sample.hello", undefined, EXPLICIT_LOCALE) ?? null,
          ),
        },
        {
          label: t("page.dev.localization.t.raw.fallback.title"),
          code: `t.raw("dev_localization.missing_key", "fallback value")`,
          description: t("page.dev.localization.t.raw.fallback.description"),
          value: String(t.raw("dev_localization.missing_key", "fallback value")),
        },
        {
          label: t("page.dev.localization.t.array.title"),
          code: `t.array("page.dev.localization.sample.tags")`,
          description: t("page.dev.localization.t.array.description"),
          value: JSON.stringify(t.array("page.dev.localization.sample.tags") ?? []),
        },
        {
          label: t("page.dev.localization.t.array.fallback.title"),
          code: `t.array("dev_localization.missing_key", ["Fallback", "Items"])`,
          description: t("page.dev.localization.t.array.fallback.description"),
          value: JSON.stringify(t.array("dev_localization.missing_key", ["Fallback", "Items"])),
        },
        {
          label: t("page.dev.localization.t.plural.title"),
          code: `t.plural(1)\nt.plural(5)\nt.plural(2, "${EXPLICIT_LOCALE}")`,
          description: t("page.dev.localization.t.plural.description"),
          value: `1: ${t.plural(1)}\n5: ${t.plural(5)}\n2 (${EXPLICIT_LOCALE}): ${t.plural(2, EXPLICIT_LOCALE)}`,
        },
        {
          label: t("page.dev.localization.t.localize.title"),
          code: `t.localize({ en: "English", pt: "Português", es: "Español" })`,
          description: t("page.dev.localization.t.localize.description"),
          value: `${getCurrentLocale()}: ${t.localize({ en: "English", pt: "Português", es: "Español" })}\nes: ${t.localize(
            { en: "English", pt: "Português", es: "Español" },
            "es",
          )}`,
        },
        {
          label: t("page.dev.localization.t.missing.title"),
          code: `t.raw("dev_localization.does_not_exist")`,
          description: t("page.dev.localization.t.missing.description"),
          value: t.raw("dev_localization.does_not_exist"),
        },
      ],
    },
  ];

  return (
    <div class="flex flex-col gap-2xl">
      <header class="flex flex-col gap-xs">
        <h1 class="text-3xl text-highlighted">{t("page.dev.localization.title")}</h1>
        <p class="text-sm text-muted">{t("page.dev.localization.description")}</p>
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
                    <div class="grid grid-cols-1 items-start gap-xl px-xl py-md lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
                      <div class="flex min-w-0 flex-col gap-xs">
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
  );
}
