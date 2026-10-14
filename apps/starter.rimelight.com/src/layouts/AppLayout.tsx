import { type Component, Show, createSignal, onSettled } from "solid-js";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import AppHeader from "#components/app/AppHeader";
import AppFooter from "#components/app/AppFooter";
import {
  RLBanner,
  RLMain,
  RLScrollToTop,
  RLShortcuts,
  RLLayoutGrid,
  RLToaster,
  RLToast,
  RLButton,
  RLRouteAnnouncer,
  RLNavigationProgress,
} from "@rimelight/ui";
import { t, getLocaleUrl } from "@rimelight/i18n";

export interface AppLayoutProps {
  title?: string | undefined;
  description?: string | undefined;
  children?: JSX.Element | undefined;
  session?: any;
}

export const AppLayout: Component<AppLayoutProps> = (props) => {
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

  useHead(() => createSeoHead({ title: props.title, description: props.description }));

  return (
    <>
      <div class="isolate flex flex-col min-h-screen">
        <a
          href="#main-content"
          class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-neutral-50 focus:text-highlighted"
        >
          {t("app_layout.skipToContent")}
        </a>

        <RLBanner
          contain={false}
          dismissable={true}
          dismissId="v2-announcement"
          stackIndex={0}
          class="bg-primary text-neutral-50 font-medium"
          actions={[
            { label: "Learn more", href: "/docs", variant: "solid" },
            { label: "What's new", href: "/changelog", variant: "outline" },
          ]}
        >
          New: Rimelight v2 is out
        </RLBanner>

        <AppHeader stackIndex={1} session={props.session} />

        <RLMain id="main-content" class="flex-1">
          {props.children}
        </RLMain>

        <AppFooter />

        <RLScrollToTop showProgress={true} />
        <RLShortcuts />
        <RLLayoutGrid />
        <RLToaster />
        <RLRouteAnnouncer />
        <RLNavigationProgress />

        <Show when={!hasConsent()}>
          <div
            id="cookie-notice-container"
            class="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 pointer-events-none transition-all duration-300"
          >
            <RLToast
              title={t("cookie_notice.title")}
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
                    {t("cookie_notice.allow_all")}
                  </RLButton>
                  <RLButton
                    variant="solid"
                    color="error"
                    size="sm"
                    onClick={() => setCookieAndDismiss("denied")}
                  >
                    {t("cookie_notice.deny_all")}
                  </RLButton>
                </div>
              }
            >
              <span>
                {t("cookie_notice.description_prefix")}{" "}
                <a
                  href={getLocaleUrl("/legal/cookie-policy")}
                  class="underline hover:text-primary transition-colors font-medium"
                >
                  {t("cookie_notice.cookie_policy_label")}
                </a>{" "}
                {t("cookie_notice.description_suffix")}
              </span>
            </RLToast>
          </div>
        </Show>
      </div>
    </>
  );
};

export default AppLayout;
