import { children, For, Show, type Component } from "solid-js";
import { type JSX } from "@solidjs/web";
import { useLocation } from "@solidjs/router";
import DevLayout from "#layouts/DevLayout";
import { getCurrentLocale, getLocaleUrl, getLocales, t } from "@rimelight/i18n";
import { RLButton, RLLocaleSelector } from "@rimelight/ui";

const EXPLICIT_LOCALE = "pt";

interface Entry {
  section?: string;
  label?: string;
  mono?: boolean;
  code?: string;
  description?: string;
  value?: string;
  content?: JSX.Element;
}

const Row: Component<Entry> = (props) => {
  const content = children(() => props.content);
  return (
    <div
      class={`flex flex-col gap-2 border-t border-default/60 px-5 py-4 first:border-t-0${
        props.section ? " bg-elevated/40" : ""
      }`}
    >
      <Show when={props.section !== undefined}>
        <h2 class={`text-xs font-semibold text-muted${props.mono ? " font-mono" : ""}`}>
          {props.section}
        </h2>
      </Show>
      <Show when={props.label !== undefined || props.code !== undefined}>
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span class={`text-sm font-semibold text-highlighted${props.mono ? " font-mono" : ""}`}>
            {props.label}
          </span>
          <Show when={props.code !== undefined}>
            <code class="text-xs text-muted whitespace-pre-wrap">{props.code}</code>
          </Show>
        </div>
      </Show>
      <Show when={props.description !== undefined}>
        <p class="text-xs text-muted">{props.description}</p>
      </Show>
      <Show when={props.value !== undefined}>
        <span class="font-mono text-sm text-highlighted break-words whitespace-pre-line">
          {props.value}
        </span>
      </Show>
      {content()}
    </div>
  );
};

export default function DevLocalizationPage() {
  const location = useLocation();

  const entries = (): Entry[] => [
    { section: t("dev_localization.current_values") },
    { label: t("dev_localization.current_locale"), value: getCurrentLocale() },
    { label: t("dev_localization.window_pathname"), value: location.pathname },
    { label: t("dev_localization.available_locales"), value: JSON.stringify(getLocales()) },

    { section: "getLocales()", mono: true },
    {
      content: <RLLocaleSelector locales={getLocales()} currentLocale={getCurrentLocale()} />,
    },

    { section: "getLocaleUrl()", mono: true },
    ...getLocales().map((code) => ({
      label: code,
      mono: true,
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

    { section: "t()", mono: true },
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
  ];

  return (
    <DevLayout>
      <div class="flex flex-col gap-6">
        <header class="flex flex-col gap-3">
          <h1 class="text-3xl font-bold text-highlighted">{t("dev_localization.title")}</h1>
          <p class="text-sm text-muted">{t("dev_localization.description")}</p>
        </header>

        <div class="overflow-hidden rounded-2xl border border-default bg-elevated/20">
          <For each={entries()}>{(entry) => <Row {...entry} />}</For>
        </div>
      </div>
    </DevLayout>
  );
}
