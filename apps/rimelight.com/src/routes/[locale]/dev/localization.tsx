import { For, Show, type Component } from "solid-js";
import { type JSX } from "@solidjs/web";
import { useLocation } from "@solidjs/router";
import DevLayout from "#layouts/DevLayout";
import { getCurrentLocale, getLocaleUrl, getLocales, t } from "@rimelight/i18n";
import { RLButton, RLLocaleSelector } from "@rimelight/ui";

const EXPLICIT_LOCALE = "pt";

const Section: Component<{ title: JSX.Element; children: JSX.Element }> = (props) => (
  <section class="p-4 bg-muted flex flex-col gap-sm">
    <h2>{props.title}</h2>
    {props.children}
  </section>
);

export default function DevLocalizationPage() {
  const location = useLocation();

  const sections = (): Array<{ title: JSX.Element; content: JSX.Element }> => [
    {
      title: t("dev_localization.current_values"),
      content: (
        <div class="flex flex-col gap-sm">
          <For
            each={[
              { label: t("dev_localization.current_locale"), value: getCurrentLocale() },
              { label: t("dev_localization.window_pathname"), value: location.pathname },
              {
                label: t("dev_localization.available_locales"),
                value: JSON.stringify(getLocales()),
              },
            ]}
          >
            {(row, index) => (
              <>
                <Show when={index() > 0}>
                  <hr class="border-neutral" />
                </Show>
                <div class="flex justify-between">
                  <span class="text-muted">{row.label}:</span>
                  <span class="font-bold">{row.value}</span>
                </div>
              </>
            )}
          </For>
        </div>
      ),
    },
    {
      title: <code>getLocales()</code>,
      content: <RLLocaleSelector locales={getLocales()} currentLocale={getCurrentLocale()} />,
    },
    {
      title: <code>getLocaleUrl()</code>,
      content: (
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
                label={t("dev_localization.goto_locale", { locale: code })}
                rel="external"
              />
            )}
          </For>
        </div>
      ),
    },
    {
      title: <code>t()</code>,
      content: (
        <div class="flex flex-col gap-md">
          <For
            each={[
              {
                title: t("dev_localization.t_basic_title"),
                code: `t("dev_localization.sample_hello")`,
                description: t("dev_localization.t_basic_description"),
                output: t("dev_localization.sample_hello"),
              },
              {
                title: t("dev_localization.t_interpolation_title"),
                code: `t("dev_localization.sample_greeting", { name: "Ada" })`,
                description: t("dev_localization.t_interpolation_description"),
                output: t("dev_localization.sample_greeting", { name: "Ada" }),
              },
              {
                title: t("dev_localization.t_count_title"),
                code: `t("dev_localization.sample_items", { count: 1 })\nt("dev_localization.sample_items", { count: 1234 })`,
                description: t("dev_localization.t_count_description"),
                output: (
                  <div class="flex flex-col">
                    <span>{t("dev_localization.sample_items", { count: 1 })}</span>
                    <span>{t("dev_localization.sample_items", { count: 1234 })}</span>
                  </div>
                ),
              },
              {
                title: t("dev_localization.t_locale_title"),
                code: `t("dev_localization.sample_hello", undefined, "${EXPLICIT_LOCALE}")`,
                description: t("dev_localization.t_locale_description"),
                output: (
                  <div class="flex flex-col">
                    <span>{`${getCurrentLocale()}: ${t("dev_localization.sample_hello")}`}</span>
                    <span>
                      {`${EXPLICIT_LOCALE}: ${t("dev_localization.sample_hello", undefined, EXPLICIT_LOCALE)}`}
                    </span>
                  </div>
                ),
              },
              {
                title: t("dev_localization.t_raw_title"),
                code: `t.raw("dev_localization.sample_object")`,
                description: t("dev_localization.t_raw_description"),
                output: JSON.stringify(t.raw("dev_localization.sample_object") ?? null),
              },
              {
                title: t("dev_localization.t_raw_fallback_title"),
                code: `t.raw("dev_localization.missing_key", "fallback value")`,
                description: t("dev_localization.t_raw_fallback_description"),
                output: t.raw("dev_localization.missing_key", "fallback value"),
              },
              {
                title: t("dev_localization.t_array_title"),
                code: `t.array("dev_localization.sample_tags")`,
                description: t("dev_localization.t_array_description"),
                output: JSON.stringify(t.array("dev_localization.sample_tags") ?? []),
              },
              {
                title: t("dev_localization.t_plural_title"),
                code: `t.plural(1)\nt.plural(5)\nt.plural(2, "${EXPLICIT_LOCALE}")`,
                description: t("dev_localization.t_plural_description"),
                output: (
                  <div class="flex flex-col">
                    <span>{`1: ${t.plural(1)}`}</span>
                    <span>{`5: ${t.plural(5)}`}</span>
                    <span>{`2 (${EXPLICIT_LOCALE}): ${t.plural(2, EXPLICIT_LOCALE)}`}</span>
                  </div>
                ),
              },
              {
                title: t("dev_localization.t_localize_title"),
                code: `t.localize({ en: "English", pt: "Português", es: "Español" })`,
                description: t("dev_localization.t_localize_description"),
                output: (
                  <div class="flex flex-col">
                    <span>
                      {`${getCurrentLocale()}: ${t.localize({ en: "English", pt: "Português", es: "Español" })}`}
                    </span>
                    <span>
                      {`es: ${t.localize({ en: "English", pt: "Português", es: "Español" }, "es")}`}
                    </span>
                  </div>
                ),
              },
              {
                title: t("dev_localization.t_missing_title"),
                code: `t("dev_localization.does_not_exist")`,
                description: t("dev_localization.t_missing_description"),
                output: t("dev_localization.does_not_exist"),
              },
            ]}
          >
            {(demo) => (
              <div class="flex flex-col gap-1 border-t border-neutral pt-3 first:border-t-0 first:pt-0">
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <span class="font-bold">{demo.title}</span>
                  <code class="text-xs text-muted whitespace-pre-wrap">{demo.code}</code>
                </div>
                <p class="text-xs text-muted">{demo.description}</p>
                <div class="font-mono text-sm text-highlighted break-words">{demo.output}</div>
              </div>
            )}
          </For>
        </div>
      ),
    },
  ];

  return (
    <DevLayout>
      <div class="flex flex-col gap-md">
        <header class="flex flex-col gap-sm">
          <h1 class="text-3xl font-bold text-highlighted">{t("dev_localization.title")}</h1>
          <p class="text-sm text-muted">{t("dev_localization.description")}</p>
          <hr class="border-neutral" />
        </header>

        <For each={sections()}>
          {(section) => <Section title={section.title}>{section.content}</Section>}
        </For>
      </div>
    </DevLayout>
  );
}
