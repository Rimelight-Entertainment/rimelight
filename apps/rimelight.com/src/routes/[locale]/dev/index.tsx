import { type Component, For } from "solid-js";
import DevLayout from "#layouts/DevLayout";
import { getCurrentLocale, getLocaleUrl } from "@rimelight/i18n";

interface DevSectionCard {
  title: string;
  href: string;
  tag: string;
  description: string;
  icon: string;
  badgeColor?: string;
}

const sections: DevSectionCard[] = [
  {
    title: "Component Audit Hub",
    href: "/dev/components",
    tag: "UI Audit Suite",
    description:
      "Interactive sandboxes, edge-case test scenarios, WCAG checklists, and prop spec sheets for 19+ Rimelight UI components.",
    icon: "i-lucide-component",
  },
  {
    title: "Design System Showcase",
    href: "/dev/design-system",
    tag: "Design Tokens & Colors",
    description:
      "Interactive hybrid OKLCH palette scales, 8x8 intent contrast matrix, 11x11 shade grid, dual-mode preview sandbox, and component theming.",
    icon: "i-lucide-layers",
  },
  {
    title: "Locale & i18n Debugger",
    href: "/dev/locale",
    tag: "Internationalization",
    description:
      "Barebones locale switcher test, URL rewriting diagnostics, and verification of @rimelight/i18n client/server sync.",
    icon: "i-lucide-globe",
  },
  {
    title: "OpenGraph Image Previewer",
    href: "/dev/og",
    tag: "SEO & Social",
    description:
      "Live preview and validation tool for dynamic OG banner generation with customizable title, description, and tags.",
    icon: "i-lucide-image",
  },
];

export const DevIndexPage: Component = () => {
  const locale = () => getCurrentLocale();

  return (
    <DevLayout
      title="Rimelight Developer Workspace"
      description="Central hub for component auditing, runtime benchmarks, and testing utilities"
      currentSection="hub"
      maxWidth="6xl"
    >
      <div class="flex flex-col gap-8">
        {/* Workspace Intro Header */}
        <div class="border-b border-default pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-black tracking-tight text-highlighted">Developer Workspace</h1>
            <p class="text-sm text-muted mt-2 max-w-2xl leading-relaxed">
              Standardized, isolated test environment and feature auditing suite for Rimelight. Zero
              layout pollution to ensure uncompromised test accuracy.
            </p>
          </div>
          <div class="flex items-center gap-2 font-mono text-xs text-muted">
            <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dev Environment Active</span>
          </div>
        </div>

        {/* Audit Cards Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For each={sections}>
            {(s) => (
              <a
                href={getLocaleUrl(s.href, locale())}
                class="flex flex-col justify-between p-6 rounded-2xl border border-default bg-elevated/20 hover:bg-elevated/50 hover:border-primary/50 transition-all group shadow-xs"
              >
                <div>
                  <div class="flex items-center justify-between gap-2 mb-3">
                    <div class="flex items-center gap-2.5">
                      <span
                        class={`${s.icon} size-5 text-primary group-hover:scale-110 transition-transform`}
                      />
                      <h2 class="text-base font-bold text-highlighted group-hover:text-primary transition-colors">
                        {s.title}
                      </h2>
                    </div>
                  </div>
                  <span class="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold mb-3 border border-primary/20">
                    {s.tag}
                  </span>
                  <p class="text-xs text-muted leading-relaxed">{s.description}</p>
                </div>
                <div class="flex items-center justify-end pt-4 mt-4 border-t border-default/40 text-xs font-mono text-muted group-hover:text-primary">
                  <span class="group-hover:translate-x-1 transition-transform font-bold">
                    Open Tool →
                  </span>
                </div>
              </a>
            )}
          </For>
        </div>
      </div>
    </DevLayout>
  );
};

export default DevIndexPage;
