import { For } from "solid-js";
import { RLCard } from "@rimelight/ui/components/card/RLCard.tsx";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { getLocaleUrl, t } from "@rimelight/i18n";

const dashboardCards = [
  {
    href: "/dev/user-interface",
    titleKey: "page.dev.index.card.user.interface.title",
    descriptionKey: "page.dev.index.card.user.interface.description",
  },
  {
    href: "/dev/components",
    titleKey: "page.dev.index.card.components.title",
    descriptionKey: "page.dev.index.card.components.description",
  },
  {
    href: "/dev/localization",
    titleKey: "page.dev.index.card.localization.title",
    descriptionKey: "page.dev.index.card.localization.description",
  },
  {
    href: "/dev/security",
    titleKey: "page.dev.index.card.security.title",
    descriptionKey: "page.dev.index.card.security.description",
  },
  {
    href: "/dev/seo",
    titleKey: "page.dev.index.card.seo.title",
    descriptionKey: "page.dev.index.card.seo.description",
  },
] as const;

export default function DevIndexPage() {
  return (
    <RLPageSection title={t("page.dev.index.title")} description={t("page.dev.index.description")}>
      <RLGrid cols={3} gap="lg">
        <For each={dashboardCards}>
          {(card) => (
            <RLCard
              href={getLocaleUrl(card.href)}
              title={t(card.titleKey)}
              description={t(card.descriptionKey)}
            />
          )}
        </For>
      </RLGrid>
    </RLPageSection>
  );
}
