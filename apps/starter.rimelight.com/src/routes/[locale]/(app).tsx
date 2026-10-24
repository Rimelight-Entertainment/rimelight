import { type Component, Show, createSignal, onSettled } from "solid-js";
import type { RouteSectionProps } from "@solidjs/router";
import AppHeader from "#components/app/AppHeader";
import AppFooter from "#components/app/AppFooter";
import {
  RLBanner,
  RLMain,
  RLScrollToTop,
  RLShortcuts,
  RLToaster,
  RLRouteAnnouncer,
  RLLayoutGrid,
  RLToast,
  RLButton,
} from "@rimelight/ui";
import { t, getLocaleUrl } from "@rimelight/i18n";

export const AppRouteLayout: Component<RouteSectionProps> = (props) => {
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
    <div class="isolate flex flex-col min-h-screen">
      <RLBanner
        id="v2-announcement"
        contain={false}
        close={true}
        stackIndex={0}
        class="bg-primary text-neutral-50 font-medium"
        actions={[
          {
            label: t("app.banner.actions.learn-more") || "Learn more",
            href: getLocaleUrl("/docs"),
            variant: "solid",
          },
          {
            label: t("app.banner.actions.whats-new") || "What's new",
            href: getLocaleUrl("/changelog"),
            variant: "outline",
          },
        ]}
      >
        {t("app.banner.content") || "New: Rimelight v2 is out"}
      </RLBanner>
      <AppHeader stackIndex={1} />
      <RLMain>{props.children}</RLMain>
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
            title={t("cookie.notice.title")}
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
                  {t("cookie.notice.allow.all")}
                </RLButton>
                <RLButton
                  variant="solid"
                  color="error"
                  size="sm"
                  onClick={() => setCookieAndDismiss("denied")}
                >
                  {t("cookie.notice.deny.all")}
                </RLButton>
              </div>
            }
          >
            <span>
              {t("cookie.notice.description.prefix")}{" "}
              <a
                href={getLocaleUrl("/legal/cookie-policy")}
                class="underline hover:text-primary transition-colors font-medium"
              >
                {t("cookie.notice.cookie.policy.label")}
              </a>{" "}
              {t("cookie.notice.description.suffix")}
            </span>
          </RLToast>
        </div>
      </Show>
    </div>
  );
};

export default AppRouteLayout;
