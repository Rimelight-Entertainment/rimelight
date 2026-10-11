import { Show, type Component } from "solid-js";
import { useParams } from "@solidjs/router";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { getCurrentLocale, getLocaleUrl, getLocales, setCurrentLocale } from "@rimelight/i18n";
import { RLLocaleSelector, RLLogo, RLHeader, RLMain, RLThemeSelector } from "@rimelight/ui";

const BRAND = "Rimelight Developer Workspace";

export interface DevLayoutProps {
  title: string;
  description?: string;
  currentSection?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
  noContainerPadding?: boolean;
  actions?: JSX.Element;
  children?: JSX.Element;
}

export const DevLayout: Component<DevLayoutProps> = (props) => {
  const params = useParams<{ locale?: string }>();
  if (params.locale && getLocales().includes(params.locale)) {
    setCurrentLocale(params.locale);
  }

  useHead(
    () =>
      createSeoHead({
        title: `${props.title} | Dev`,
        description: props.description,
        noindex: true,
      }).tags,
  );

  const locale = () => getCurrentLocale();

  const getWidthClass = () => {
    switch (props.maxWidth) {
      case "sm":
        return "max-w-sm";
      case "md":
        return "max-w-md";
      case "lg":
        return "max-w-lg";
      case "xl":
        return "max-w-xl";
      case "2xl":
        return "max-w-2xl";
      case "3xl":
        return "max-w-3xl";
      case "4xl":
        return "max-w-4xl";
      case "5xl":
        return "max-w-5xl";
      case "6xl":
        return "max-w-6xl";
      case "full":
        return "max-w-full";
      case "7xl":
      default:
        return "max-w-90rem";
    }
  };

  const navHref = (path: string) => {
    return getLocaleUrl(path, locale());
  };

  return (
    <div class="min-h-screen flex flex-col bg-default text-default font-sans antialiased">
      {/* Lean Dev Header Navigation */}
      <RLHeader
        class="border-b border-default bg-elevated/80 backdrop-blur-md"
        left={
          <div class="flex items-center gap-3 min-w-0">
            <RLLogo
              variant="logomark"
              mode="color"
              href={navHref("/dev")}
              class="h-5 w-auto"
              alt={BRAND}
            />
            <a
              href={navHref("/dev")}
              class="flex items-center font-mono text-xs font-bold leading-none text-highlighted hover:text-primary transition-colors"
            >
              {BRAND}
            </a>
            <Show when={props.title !== BRAND}>
              <span class="font-mono text-xs leading-none text-muted/40">/</span>
              <span class="truncate font-mono text-xs leading-none text-muted">{props.title}</span>
            </Show>
          </div>
        }
        right={
          <div class="flex items-center gap-2">
            <RLLocaleSelector
              mode="icon"
              size="xs"
              locales={getLocales()}
              currentLocale={getCurrentLocale()}
            />
            <RLThemeSelector size="xs" mode="icon" />
            {props.actions}
          </div>
        }
      />

      {/* Main Dev Content Workspace */}
      <RLMain
        id="main-content"
        class={`flex-1 mx-auto w-full px-xs sm:px-md md:px-xl lg:px-xl ${props.noContainerPadding ? "" : "py-8"} ${getWidthClass()} flex flex-col gap-6`}
      >
        {props.children}
      </RLMain>
    </div>
  );
};

export default DevLayout;
