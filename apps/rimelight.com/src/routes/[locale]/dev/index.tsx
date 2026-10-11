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
    title: "Colors & Intent Matrix",
    href: "/dev/colors",
    tag: "OKLCH Tokens",
    description:
      "Hybrid OKLCH palette scales, 8x8 semantic intent contrast matrix, 11x11 shade grid, and dual-mode live preview sandbox.",
    icon: "i-lucide-palette",
  },
  {
    title: "Design System Showcase",
    href: "/dev/design-system",
    tag: "Design Tokens",
    description:
      "Live verification of hybrid seed-matrix palettes, component scoped theming (rl-color-*), layout grids, and slot UI overrides.",
    icon: "i-lucide-layers",
  },
  {
    title: "Data Table Benchmark",
    href: "/dev/table",
    tag: "Performance",
    description:
      "High-performance native SolidJS RLTable with 500+ row virtualization, multi-sort, column reorder, grouping, and sub-rows.",
    icon: "i-lucide-table",
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
    title: "Selector Controls Debugger",
    href: "/dev/selectors",
    tag: "UI Primitives",
    description:
      "Isolated testing of RLLocaleSelector and RLThemeSelector components across initial values, reactive state, and props.",
    icon: "i-lucide-sliders",
  },
  {
    title: "OpenGraph Image Previewer",
    href: "/dev/og",
    tag: "SEO & Social",
    description:
      "Live preview and validation tool for dynamic OG banner generation with customizable title, description, and tags.",
    icon: "i-lucide-image",
  },
  {
    title: "Email Templates Previewer",
    href: "/dev/email",
    tag: "Transactional",
    description:
      "Live render previews and test dispatch triggers for verification, password reset, and signup notification emails.",
    icon: "i-lucide-mail",
  },
  {
    title: "Accordion Deep-Dive Audit",
    href: "/dev/accordion",
    tag: "Detailed Audit",
    description:
      "Dedicated multi-section audit for RLAccordion covering SSR HTML5 details/summary, reactive islands, and custom slots.",
    icon: "i-lucide-chevrons-up-down",
  },
];

export const DevIndexPage: Component = () => {
  const locale = () => getCurrentLocale();

  return (
    <DevLayout
      title="Developer Workspace"
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
