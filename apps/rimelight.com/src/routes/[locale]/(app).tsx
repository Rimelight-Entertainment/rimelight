import type { RouteSectionProps } from "@solidjs/router";
import { createSignal, onSettled, Show } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import AppHeader from "#components/app/AppHeader";
import AppFooter from "#components/app/AppFooter";
import {
  RLMain,
  RLScrollToTop,
  RLShortcuts,
  RLToaster,
  RLRouteAnnouncer,
  RLLayoutGrid,
  RLToast,
  RLButton,
  RLErrorBoundary,
} from "@rimelight/ui";
import { t, getLocaleUrl } from "@rimelight/i18n";

export interface AppRouteLayoutProps extends RouteSectionProps {
  title?: string;
  description?: string;
  noindex?: boolean;
  robots?: string;
  ogImageSrc?: string;
  ogImageAlt?: string;
  session?: any;
}

export default function AppRouteLayout(props: AppRouteLayoutProps) {
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
        <AppHeader stackIndex={0} session={props.session} />
        <RLMain>
          <RLErrorBoundary resetKey={props.location.pathname}>{props.children}</RLErrorBoundary>
        </RLMain>
        <AppFooter />
        <RLScrollToTop />
        <RLShortcuts />
        <RLToaster />
        <RLRouteAnnouncer />
        <RLLayoutGrid />
        <Show when={!hasConsent()}>
          <div
            id="cookie-notice-container"
            class="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 pointer-events-none transition-all duration-300"
          >
            <RLToast
              title={t("cookie.notice.title") || "Cookie Preferences"}
              dismissable={false}
              duration={0}
              class="pointer-events-auto shadow-2xl border-default bg-neutral-50/95 backdrop-blur-sm"
              actionsSlot={
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
}
