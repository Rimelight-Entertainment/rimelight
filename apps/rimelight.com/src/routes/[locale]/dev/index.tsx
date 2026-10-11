import DevLayout from "#layouts/DevLayout";
import { getLocaleUrl } from "@rimelight/i18n";
import { RLCard, RLGrid, RLPageSection } from "@rimelight/ui";

export default function DevIndexPage() {
  return (
    <DevLayout
      title="Dashboard"
      description="Central hub for component auditing, runtime benchmarks, and testing utilities"
    >
      <RLPageSection
        title="Dashboard"
        description="Standardized, isolated test environment and feature auditing suite for Rimelight. Zero layout pollution to ensure uncompromised test accuracy."
      >
        <RLGrid cols={3} gap="lg">
          <RLCard
            href={getLocaleUrl("/dev/design-system")}
            title="Design System"
            description="Interactive hybrid OKLCH palette scales, 8x8 intent contrast matrix, 11x11 shade grid, dual-mode preview sandbox, and component theming."
          />
          <RLCard
            href={getLocaleUrl("/dev/components")}
            title="Components"
            description="Interactive sandboxes, edge-case test scenarios, WCAG checklists, and prop spec sheets for 19+ Rimelight UI components."
          />
          <RLCard
            href={getLocaleUrl("/dev/locale")}
            title="i18n"
            description="Barebones locale switcher test, URL rewriting diagnostics, and verification of @rimelight/i18n client/server sync."
          />
          <RLCard
            href={getLocaleUrl("/dev/og")}
            title="OpenGraph"
            description="Live preview and validation tool for dynamic OG banner generation with customizable title, description, and tags."
          />
        </RLGrid>
      </RLPageSection>
    </DevLayout>
  );
}
