import { type Component, For, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import BlankLayout from "#layouts/BlankLayout";
import { getCurrentLocale, getLocaleUrl } from "@rimelight/i18n";
import { RLThemeSelector } from "@rimelight/ui";

export interface DevNavSection {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string;
}

export const DEV_NAV_ITEMS: DevNavSection[] = [
  { id: "hub", label: "Dev Hub", href: "/dev", icon: "i-lucide-layout-grid" },
  { id: "components", label: "Components", href: "/dev/components", icon: "i-lucide-component" },
  { id: "colors", label: "Colors", href: "/dev/colors", icon: "i-lucide-palette" },
  {
    id: "design-system",
    label: "Design System",
    href: "/dev/design-system",
    icon: "i-lucide-layers",
  },
  { id: "table", label: "Table", href: "/dev/table", icon: "i-lucide-table" },
  { id: "locale", label: "Locale", href: "/dev/locale", icon: "i-lucide-globe" },
  { id: "selectors", label: "Selectors", href: "/dev/selectors", icon: "i-lucide-sliders" },
  { id: "og", label: "OG Images", href: "/dev/og", icon: "i-lucide-image" },
  { id: "email", label: "Emails", href: "/dev/email", icon: "i-lucide-mail" },
];

export interface DevLayoutProps {
  title: string;
  description?: string;
  currentSection?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "5xl" | "6xl" | "7xl" | "full";
  noContainerPadding?: boolean;
  actions?: JSX.Element;
  children?: JSX.Element;
}

export const DevLayout: Component<DevLayoutProps> = (props) => {
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
    <BlankLayout title={`${props.title} | Dev`} description={props.description} noindex={true}>
      <div class="min-h-screen flex flex-col bg-default text-default font-sans antialiased">
        {/* Lean Dev Header Navigation */}
        <header class="sticky top-0 z-40 w-full border-b border-default bg-elevated/80 backdrop-blur-md">
          <div class="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
            {/* Dev Branding & Section Breadcrumb */}
            <div class="flex items-center gap-3 shrink-0">
              <a
                href={navHref("/dev")}
                class="flex items-center gap-2 font-mono text-xs font-bold text-highlighted hover:text-primary transition-colors"
              >
                <span class="size-6 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black">
                  λ
                </span>
                <span class="tracking-tight">DEV</span>
              </a>
              <span class="text-dimmed text-xs font-mono">/</span>
              <span class="text-xs font-semibold text-toned truncate max-w-[140px] sm:max-w-xs">
                {props.title}
              </span>
            </div>

            {/* Quick Switcher Nav Tabs */}
            <nav class="hidden md:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
              <For each={DEV_NAV_ITEMS}>
                {(item) => {
                  const isActive = () => props.currentSection === item.id;
                  return (
                    <a
                      href={navHref(item.href)}
                      class={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                        isActive()
                          ? "bg-primary text-inverted font-bold shadow-xs"
                          : "text-muted hover:text-highlighted hover:bg-elevated/80"
                      }`}
                    >
                      <Show when={item.icon}>
                        <span class={`${item.icon} size-3.5`} />
                      </Show>
                      <span>{item.label}</span>
                    </a>
                  );
                }}
              </For>
            </nav>

            {/* Utility Controls */}
            <div class="flex items-center gap-2 shrink-0">
              <RLThemeSelector size="xs" />
              {props.actions}
            </div>
          </div>

          {/* Mobile Navigation Sub-bar */}
          <div class="md:hidden border-t border-default/40 px-4 py-2 flex items-center gap-1 overflow-x-auto scrollbar-none bg-muted/20">
            <For each={DEV_NAV_ITEMS}>
              {(item) => {
                const isActive = () => props.currentSection === item.id;
                return (
                  <a
                    href={navHref(item.href)}
                    class={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap ${
                      isActive()
                        ? "bg-primary text-inverted font-bold"
                        : "text-muted hover:text-highlighted"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              }}
            </For>
          </div>
        </header>

        {/* Main Dev Content Workspace */}
        <main
          class={`flex-1 container mx-auto px-4 ${props.noContainerPadding ? "" : "py-8"} ${getWidthClass()} w-full flex flex-col gap-6`}
        >
          {props.children}
        </main>
      </div>
    </BlankLayout>
  );
};

export default DevLayout;
