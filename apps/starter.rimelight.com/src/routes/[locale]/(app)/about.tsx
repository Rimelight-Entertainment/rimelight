import { type Component } from "solid-js";
import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";
import { RLCard } from "@rimelight/ui/components/card/RLCard.tsx";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import { t } from "@rimelight/i18n";

export const AboutPage: Component = () => {
  useHead(() =>
    createPageHead({
      title: t("page.about.meta.title"),
      description: t("page.about.meta.description"),
    }),
  );

  return (
    <>
      <RLPageSection
        variant="hero"
        title={t("page.about.hero.title")}
        description={t("page.about.hero.description")}
        orientation="horizontal"
      >
        <RLImage
          src="https://cdn.rimelight.com/images/placeholder.webp"
          alt=""
          ui={{
            root: "w-full aspect-video relative block",
            trigger: "absolute inset-0 w-full h-full block",
            triggerImage: "absolute inset-0 w-full h-full object-cover rounded-lg",
          }}
        />
      </RLPageSection>

      <RLPageSection
        title={t("page.about.section.about.template.title")}
        description={t("page.about.section.about.template.description")}
        orientation="vertical"
      />

      <RLPageSection
        title={t("page.about.section.values.title")}
        description={t("page.about.section.values.description")}
        orientation="vertical"
      >
        <RLGrid>
          <RLCard
            title={t("page.about.value.dx.title")}
            description={t("page.about.value.dx.description")}
          />
          <RLCard
            title={t("page.about.value.design.title")}
            description={t("page.about.value.design.description")}
          />
          <RLCard
            title={t("page.about.value.performance.title")}
            description={t("page.about.value.performance.description")}
          />
        </RLGrid>
      </RLPageSection>
    </>
  );
};

export default AboutPage;
