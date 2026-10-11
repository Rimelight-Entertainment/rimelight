import { type Component, For } from "solid-js";
import DevLayout from "#layouts/DevLayout";
import { getCurrentLocale, getLocaleUrl } from "@rimelight/i18n";
import { RLCard, RLPageSection } from "@rimelight/ui";

interface DevSectionCard {
  title: string;
  href: string;
  description: string;
  icon: string;
}

const sections: DevSectionCard[] = [
  {
    title: "Design System",
    href: "/dev/design-system",
    description:
      "Interactive hybrid OKLCH palette scales, 8x8 intent contrast matrix, 11x11 shade grid, dual-mode preview sandbox, and component theming.",
    icon: "i-lucide-layers",
  },
  {
    title: "Components",
    href: "/dev/components",
    description:
      "Interactive sandboxes, edge-case test scenarios, WCAG checklists, and prop spec sheets for 19+ Rimelight UI components.",
    icon: "i-lucide-component",
  },
  {
    title: "i18n",
    href: "/dev/locale",
    description:
      "Barebones locale switcher test, URL rewriting diagnostics, and verification of @rimelight/i18n client/server sync.",
    icon: "i-lucide-globe",
  },
  {
    title: "OpenGraph",
    href: "/dev/og",
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
    >
      <RLPageSection
        title="Rimelight Developer Workspace"
        description="Standardized, isolated test environment and feature auditing suite for Rimelight. Zero layout pollution to ensure uncompromised test accuracy."
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For each={sections}>
            {(s) => (
              <RLCard
                href={getLocaleUrl(s.href, locale())}
                title={
                  <span class="flex items-center gap-2.5">
                    <span class={`${s.icon} size-5 shrink-0 text-primary`} />
                    <span class="leading-none">{s.title}</span>
                  </span>
                }
                description={s.description}
              />
            )}
          </For>
        </div>
      </RLPageSection>
    </DevLayout>
  );
};

export default DevIndexPage;
