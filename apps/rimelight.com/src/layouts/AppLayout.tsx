import { type Component, createSignal, onSettled, Show } from "solid-js";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
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
  RLRouteAnnouncer,
} from "@rimelight/ui";
import { t, getLocaleUrl } from "@rimelight/i18n";

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
  const [hasConsent, setHasConsent] = createSignal(true);

  onSettled(() => {
    if (typeof document !== "undefined") {
      queueMicrotask(() => {
        setHasConsent(document.cookie.includes("cookie-consent="));
      });
    }
  });

  const setCookieAndDismiss = (consentValue: string) => {
    if (typeof document !== "undefined") {
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie = `cookie-consent=${consentValue}; path=/; max-age=${maxAge}; SameSite=Lax`;
      setHasConsent(true);
    }
  };

  useHead(() =>
    createSeoHead({
      title: props.title,
      description: props.description,
      noindex: props.noindex,
      robots: props.robots,
      ogImage: props.ogImageSrc
        ? { src: props.ogImageSrc, alt: props.ogImageAlt ?? "" }
        : undefined,
    }),
  );

  return (
    <>
      <div class="isolate flex flex-col min-h-screen">
        <a
          href="#main-content"
          class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-neutral-50 focus:text-highlighted"
        >
          {t("app.layout.skip-to-content") || "Skip to content"}
        </a>

        {!props.minimal && <AppHeader stackIndex={0} session={props.session} />}

        <RLMain id="main-content" class="flex-1">
          {props.children}
        </RLMain>

        <AppFooter />

        <RLScrollToTop showProgress={true} />
        <RLShortcuts />
        <RLLayoutGrid />
        <RLToaster />
        <RLRouteAnnouncer />

        <Show when={!hasConsent()}>
          <div
            id="cookie-notice-container"
            class="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 pointer-events-none transition-all duration-300"
          >
            <RLToast
              title={t("cookie.notice.title") || "Cookie Preferences"}
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
                    {t("cookie.notice.allow.all") || "Accept"}
                  </RLButton>
                  <RLButton
                    variant="solid"
                    color="error"
                    size="sm"
                    onClick={() => setCookieAndDismiss("denied")}
                  >
                    {t("cookie.notice.deny.all") || "Decline"}
                  </RLButton>
                </div>
              }
            >
              <span>
                {t("cookie.notice.description.prefix") ||
                  "We use cookies to enhance your experience."}{" "}
                <a
                  href={getLocaleUrl("/legal/cookie-policy")}
                  class="underline hover:text-primary transition-colors font-medium"
                >
                  {t("cookie.notice.cookie.policy.label") || "Cookie Policy"}
                </a>{" "}
                {t("cookie.notice.description.suffix") || ""}
              </span>
            </RLToast>
          </div>
        </Show>
      </div>
    </>
  );
};

export default AppLayout;
