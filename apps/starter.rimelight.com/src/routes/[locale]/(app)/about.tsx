import { type Component } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { RLPageSection, RLGrid, RLCard, RLImage } from "@rimelight/ui";
import { t } from "@rimelight/i18n";

export const AboutPage: Component = () => {
  useHead(() =>
    createSeoHead({
      title: t("page.about.title"),
      description: t("page.about.description"),
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
