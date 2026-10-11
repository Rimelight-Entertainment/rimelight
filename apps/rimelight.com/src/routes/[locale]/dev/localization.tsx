import { children, For, Show, type Component } from "solid-js";
import { type JSX } from "@solidjs/web";
import { useLocation } from "@solidjs/router";
import DevLayout from "#layouts/DevLayout";
import { getCurrentLocale, getLocaleUrl, getLocales, t } from "@rimelight/i18n";
import { RLButton, RLLocaleSelector } from "@rimelight/ui";

const EXPLICIT_LOCALE = "pt";

interface RowEntry {
  label?: string;
  mono?: boolean;
  code?: string;
  description?: string;
  value?: string;
  content?: JSX.Element;
}

interface SectionEntry {
  title: string;
  mono?: boolean;
  rows: RowEntry[];
}

const Row: Component<RowEntry> = (props) => {
  const content = children(() => props.content);
  return (
    <div class="flex items-start gap-6 border-t border-default/60 px-5 py-4 first:border-t-0">
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <Show when={props.label !== undefined}>
          <span class={`text-sm font-semibold text-highlighted${props.mono ? " font-mono" : ""}`}>
            {props.label}
          </span>
        </Show>
        <Show when={props.code !== undefined}>
          <code class="text-xs text-muted whitespace-pre-wrap">{props.code}</code>
        </Show>
        <Show when={props.description !== undefined}>
          <p class="text-xs text-muted">{props.description}</p>
        </Show>
      </div>
      <div class="min-w-0 text-right font-mono text-sm text-highlighted whitespace-pre-line break-words">
        {props.value}
        {content()}
      </div>
    </div>
  );
};

export default function DevLocalizationPage() {
  const location = useLocation();

  const sections = (): SectionEntry[] => [
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
      <div class="flex flex-col gap-6">
        <header class="flex flex-col gap-3">
          <h1 class="text-3xl font-bold text-highlighted">{t("dev_localization.title")}</h1>
          <p class="text-sm text-muted">{t("dev_localization.description")}</p>
        </header>

        <For each={sections()}>
          {(section) => (
            <section class="overflow-hidden rounded-2xl border border-default bg-elevated/20">
              <header class="border-b border-default/60 bg-elevated/40 px-5 py-2.5">
                <h2 class={`text-xs font-semibold text-muted${section.mono ? " font-mono" : ""}`}>
                  {section.title}
                </h2>
              </header>
              <div class="flex flex-col">
                <For each={section.rows}>{(row) => <Row {...row} />}</For>
              </div>
            </section>
          )}
        </For>
      </div>
    </DevLayout>
  );
}
