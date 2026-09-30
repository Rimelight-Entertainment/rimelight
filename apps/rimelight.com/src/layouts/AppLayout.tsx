import { type Component, Show, createSignal, onSettled } from "solid-js";
import { useParams } from "@solidjs/router";
import type { JSX } from "@solidjs/web";
import { Title, Meta } from "@solidjs/meta";
import AppHeader from "#components/app/AppHeader";
import AppFooter from "#components/app/AppFooter";
import {
  RLMain,
  RLScrollToTop,
  RLShortcuts,
  RLLayoutGrid,
  RLToaster,
  RLToast,
  RLButton,
} from "@rimelight/ui";
import { t, getRelativeLocaleUrl, currentLocale } from "@rimelight/i18n";

export interface AppLayoutProps {
  title?: string | undefined;
  description?: string | undefined;
  noindex?: boolean | undefined;
  is404?: boolean | undefined;
  minimal?: boolean | undefined;
  robots?: string | undefined;
  ogImageSrc?: string | undefined;
  ogImageAlt?: string | undefined;
  favicon?: string | undefined;
  children?: JSX.Element | undefined;
  session?: any;
}

export const AppLayout: Component<AppLayoutProps> = (props) => {
  const params = useParams<{ locale?: string }>();
  if (params.locale && ["en", "pt", "es"].includes(params.locale)) {
    currentLocale.set(params.locale);
  }

  const [hasConsent, setHasConsent] = createSignal(true);

  onSettled(() => {
    if (typeof document !== "undefined") {
      setHasConsent(document.cookie.includes("cookie-consent="));
    }
  });

  const setCookieAndDismiss = (consentValue: string) => {
    if (typeof document !== "undefined") {
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie = `cookie-consent=${consentValue}; path=/; max-age=${maxAge}; SameSite=Lax`;
      setHasConsent(true);
    }
  };

  return (
    <>
      <Show when={props.title}>
        <Title>{props.title}</Title>
      </Show>
      <Show when={props.description}>
        <Meta name="description" content={props.description} />
      </Show>
      <Show when={props.noindex}>
        <Meta name="robots" content="noindex, nofollow" />
      </Show>
      <Show when={props.robots}>
        <Meta name="robots" content={props.robots} />
      </Show>
      <Show when={props.ogImageSrc}>
        <Meta property="og:image" content={props.ogImageSrc} />
        <Meta name="twitter:image" content={props.ogImageSrc} />
      </Show>
      <Show when={props.ogImageAlt}>
        <Meta property="og:image:alt" content={props.ogImageAlt} />
      </Show>

      <div class="isolate flex flex-col min-h-screen">
        <a
          href="#main-content"
          class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-neutral-50 focus:text-highlighted"
        >
          {t("app_layout.skipToContent") || "Skip to content"}
        </a>

        {!props.minimal && <AppHeader stackIndex={1} session={props.session} />}

        <RLMain id="main-content" class="flex-1">
          {props.children}
        </RLMain>

        <AppFooter />

        <RLScrollToTop showProgress={true} />
        <RLShortcuts />
        <RLLayoutGrid />
        <RLToaster />

        <Show when={!hasConsent()}>
          <div
            id="cookie-notice-container"
            class="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 pointer-events-none transition-all duration-300"
          >
            <RLToast
              title={t("cookie_notice.title") || "Cookie Preferences"}
              dismissable={false}
              class="pointer-events-auto shadow-2xl border-default bg-neutral-50/95 backdrop-blur-sm"
              actions={
                <div class="flex items-center gap-2">
                  <RLButton
                    variant="solid"
                    color="success"
                    size="sm"
                    onClick={() => setCookieAndDismiss("allowed")}
                  >
                    {t("cookie_notice.allow_all") || "Accept"}
                  </RLButton>
                  <RLButton
                    variant="solid"
                    color="error"
                    size="sm"
                    onClick={() => setCookieAndDismiss("denied")}
                  >
                    {t("cookie_notice.deny_all") || "Decline"}
                  </RLButton>
                </div>
              }
            >
              <span>
                {t("cookie_notice.description_prefix") ||
                  "We use cookies to enhance your experience."}{" "}
                <a
                  href={getRelativeLocaleUrl("/legal/cookie-policy")}
                  class="underline hover:text-primary transition-colors font-medium"
                >
                  {t("cookie_notice.cookie_policy_label") || "Cookie Policy"}
                </a>{" "}
                {t("cookie_notice.description_suffix") || ""}
              </span>
            </RLToast>
          </div>
        </Show>
      </div>
    </>
  );
};

export default AppLayout;
