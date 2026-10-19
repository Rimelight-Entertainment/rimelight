import { For } from "solid-js";
import DevLayout from "#layouts/DevLayout";
import { RLCard, RLGrid, RLPageSection } from "@rimelight/ui";
import { getLocaleUrl, t } from "@rimelight/i18n";

const dashboardCards = [
  {
    href: "/dev/user-interface",
    titleKey: "dev_index.card_user_interface_title",
    descriptionKey: "dev_index.card_user_interface_description",
  },
  {
    href: "/dev/components",
    titleKey: "dev_index.card_components_title",
    descriptionKey: "dev_index.card_components_description",
  },
  {
    href: "/dev/localization",
    titleKey: "dev_index.card_localization_title",
    descriptionKey: "dev_index.card_localization_description",
  },
  {
    href: "/dev/security",
    titleKey: "dev_index.card_security_title",
    descriptionKey: "dev_index.card_security_description",
  },
  {
    href: "/dev/seo",
    titleKey: "dev_index.card_seo_title",
    descriptionKey: "dev_index.card_seo_description",
  },
];

export default function DevIndexPage() {
  return (
    <DevLayout title={t("dev_index.title")} description={t("dev_index.description")}>
      <RLPageSection title={t("dev_index.title")} description={t("dev_index.description")}>
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
    </DevLayout>
  );
}
