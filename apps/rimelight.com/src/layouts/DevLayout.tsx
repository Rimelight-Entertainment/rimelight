import { Show, type Component } from "solid-js";
import { useParams } from "@solidjs/router";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { getCurrentLocale, getLocaleUrl, getLocales, setCurrentLocale } from "@rimelight/i18n";
import { RLLocaleSelector, RLLogo, RLMain, RLThemeSelector } from "@rimelight/ui";

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
        return "max-w-7xl";
    }
  };

  const navHref = (path: string) => {
    return getLocaleUrl(path, locale());
  };

  return (
    <div class="min-h-screen flex flex-col bg-default text-default font-sans antialiased">
      {/* Lean Dev Header Navigation */}
      <header class="sticky top-0 z-40 w-full border-b border-default bg-elevated/80 backdrop-blur-md">
        <div
          class={`container mx-auto px-4 w-full h-14 flex items-center justify-between gap-4 ${getWidthClass()}`}
        >
          {/* Dev Homepage Link & Section Breadcrumb */}
          <div class="flex items-center gap-3 shrink-0 min-w-0">
            <RLLogo
              variant="logomark"
              mode="color"
              href={navHref("/dev")}
              class="h-5 w-auto shrink-0"
              alt={BRAND}
            />
            <a
              href={navHref("/dev")}
              class="font-mono text-xs font-bold text-highlighted hover:text-primary transition-colors shrink-0"
            >
              {BRAND}
            </a>
            <Show when={props.title !== BRAND}>
              <span class="text-muted/40 font-mono text-xs shrink-0">/</span>
              <span class="font-mono text-xs text-muted truncate">{props.title}</span>
            </Show>
          </div>

          {/* Utility Controls */}
          <div class="flex items-center gap-2 shrink-0">
            <RLLocaleSelector
              mode="icon"
              size="xs"
              locales={getLocales()}
              currentLocale={getCurrentLocale()}
            />
            <RLThemeSelector size="xs" mode="icon" />
            {props.actions}
          </div>
        </div>
      </header>

      {/* Main Dev Content Workspace */}
      <RLMain
        id="main-content"
        class={`flex-1 container mx-auto px-4 ${props.noContainerPadding ? "" : "py-8"} ${getWidthClass()} w-full flex flex-col gap-6`}
      >
        {props.children}
      </RLMain>
    </div>
  );
};

export default DevLayout;
