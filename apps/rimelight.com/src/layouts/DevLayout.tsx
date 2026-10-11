import { createMemo, Show, untrack, type Component } from "solid-js";
import { useLocation, useParams } from "@solidjs/router";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { getCurrentLocale, getLocaleUrl, getLocales, setCurrentLocale } from "@rimelight/i18n";
import { RLLocaleSelector, RLLogo, RLHeader, RLMain, RLThemeSelector } from "@rimelight/ui";

export const DEV_BRAND = "Rimelight Developer Workspace";

export type DevSectionId = "design-system" | "components" | "locale" | "og";

export type DevSectionMaxWidth =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "full";

export interface DevSection {
  id: DevSectionId;
  title: string;
  href: string;
  description: string;
  icon: string;
  maxWidth?: DevSectionMaxWidth;
}

export const devSections: DevSection[] = [
  {
    id: "design-system",
    title: "Design System",
    href: "/dev/design-system",
    description:
      "Interactive hybrid OKLCH palette scales, 8x8 intent contrast matrix, 11x11 shade grid, dual-mode preview sandbox, and component theming.",
    icon: "i-lucide-layers",
    maxWidth: "7xl",
  },
  {
    id: "components",
    title: "Components",
    href: "/dev/components",
    description:
      "Interactive sandboxes, edge-case test scenarios, WCAG checklists, and prop spec sheets for 19+ Rimelight UI components.",
    icon: "i-lucide-component",
    maxWidth: "7xl",
  },
  {
    id: "locale",
    title: "i18n",
    href: "/dev/locale",
    description:
      "Barebones locale switcher test, URL rewriting diagnostics, and verification of @rimelight/i18n client/server sync.",
    icon: "i-lucide-globe",
    maxWidth: "2xl",
  },
  {
    id: "og",
    title: "OpenGraph",
    href: "/dev/og",
    description:
      "Live preview and validation tool for dynamic OG banner generation with customizable title, description, and tags.",
    icon: "i-lucide-image",
    maxWidth: "7xl",
  },
];

export const devHub = {
  title: DEV_BRAND,
  description: "Central hub for component auditing, runtime benchmarks, and testing utilities",
  sectionDescription:
    "Standardized, isolated test environment and feature auditing suite for Rimelight. Zero layout pollution to ensure uncompromised test accuracy.",
} as const;

export interface DevLayoutProps {
  title?: string;
  description?: string;
  maxWidth?: DevSectionMaxWidth;
  noContainerPadding?: boolean;
  actions?: JSX.Element;
  children?: JSX.Element;
}

export const DevLayout: Component<DevLayoutProps> = (props) => {
  const params = useParams<{ locale?: string }>();
  untrack(() => {
    if (params.locale && getLocales().includes(params.locale)) {
      setCurrentLocale(params.locale);
    }
  });

  // The active section is derived from the URL, so dev pages need no `section`.
  const location = useLocation();
  const section = createMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const locales = getLocales();
    const rest = segments[0] && locales.includes(segments[0]) ? segments.slice(1) : segments;
    const path = `/${rest.join("/")}`;
    return devSections.find((s) => path === s.href || path.startsWith(`${s.href}/`));
  });

  const title = () => props.title ?? section()?.title ?? DEV_BRAND;
  const description = () => props.description ?? section()?.description;
  const maxWidth = () => props.maxWidth ?? section()?.maxWidth;

  useHead(
    () =>
      createSeoHead({
        title: `${title()} | Dev`,
        description: description(),
        noindex: true,
      }).tags,
  );

  const locale = () => getCurrentLocale();

  const getWidthClass = () => {
    switch (maxWidth()) {
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
              alt={DEV_BRAND}
            />
            <a
              href={navHref("/dev")}
              class="flex items-center font-mono text-xs font-bold leading-none text-highlighted hover:text-primary transition-colors"
            >
              {DEV_BRAND}
            </a>
            <Show when={title() !== DEV_BRAND}>
              <span class="font-mono text-xs leading-none text-muted/40">/</span>
              <span class="truncate font-mono text-xs leading-none text-muted">{title()}</span>
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
