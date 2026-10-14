import { For } from "solid-js";
import DevLayout from "#layouts/DevLayout";
import { RLCard, RLGrid, RLPageSection } from "@rimelight/ui";
import { getLocaleUrl } from "@rimelight/i18n";

const dashboardCards = [
  {
    href: "/dev/user-interface",
    title: "User Interface",
    description:
      "Interactive hybrid OKLCH palette scales, typography & fonts, icon library, intent contrast matrix, and component theming.",
  },
  {
    href: "/dev/components",
    title: "Components",
    description:
      "Interactive sandboxes, edge-case test scenarios, WCAG checklists, and prop spec sheets for 19+ Rimelight UI components.",
  },
  {
    href: "/dev/localization",
    title: "Localization",
    description:
      "Barebones locale switcher test, URL rewriting diagnostics, and verification of @rimelight/i18n client/server sync.",
  },
  {
    href: "/dev/security",
    title: "Security",
    description:
      "CSP header generation, nonce & Trusted Types head injection, rate-limit config inspection, and Turnstile/construction runtime diagnostics.",
  },
  {
    href: "/dev/seo",
    title: "SEO",
    description:
      "Full @rimelight/seo audit — head generation, meta utilities, structured data (JSON-LD), OG images, sitemap, robots.txt, RSS, LLMs.txt, web manifest, security.txt, and API catalog.",
  },
];

export default function DevIndexPage() {
  return (
    <DevLayout
      title="Dashboard"
      description="Standardized, isolated test environment and feature auditing suite for Rimelight. Zero layout pollution to ensure uncompromised test accuracy."
    >
      <RLPageSection
        title="Dashboard"
        description="Standardized, isolated test environment and feature auditing suite for Rimelight. Zero layout pollution to ensure uncompromised test accuracy."
      >
        <RLGrid cols={3} gap="lg">
          <For each={dashboardCards}>
            {(card) => (
              <RLCard
                href={getLocaleUrl(card.href)}
                title={card.title}
                description={card.description}
              />
            )}
          </For>
        </RLGrid>
      </RLPageSection>
    </DevLayout>
  );
}
