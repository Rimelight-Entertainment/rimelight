import { createSeoHead } from "@rimelight/seo/head";
import { useHead } from "@solidjs/web";
import { For } from "solid-js";
import { RLCard, RLGrid, RLPageSection } from "@rimelight/ui";
import { getLocaleUrl, t } from "@rimelight/i18n";

const dashboardCards = [
  {
    href: "/dev/user-interface",
    titleKey: "dev.index.card.user.interface.title",
    descriptionKey: "dev.index.card.user.interface.description",
  },
  {
    href: "/dev/components",
    titleKey: "dev.index.card.components.title",
    descriptionKey: "dev.index.card.components.description",
  },
  {
    href: "/dev/localization",
    titleKey: "dev.index.card.localization.title",
    descriptionKey: "dev.index.card.localization.description",
  },
  {
    href: "/dev/security",
    titleKey: "dev.index.card.security.title",
    descriptionKey: "dev.index.card.security.description",
  },
  {
    href: "/dev/seo",
    titleKey: "dev.index.card.seo.title",
    descriptionKey: "dev.index.card.seo.description",
  },
];

export default function DevIndexPage() {
  return (
    
      <RLPageSection title={t("dev.index.title")} description={t("dev.index.description")}>
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
