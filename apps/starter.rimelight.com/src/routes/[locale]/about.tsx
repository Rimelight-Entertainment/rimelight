import { type Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { RLPageSection, RLGrid, RLCard, RLImage } from "@rimelight/ui";
import { t } from "@rimelight/i18n";

export const AboutPage: Component = () => {
  return (
    <AppLayout title={t("page_about.title")} description={t("page_about.description")}>
      <RLPageSection
        variant="hero"
        title={t("page_about.hero_title")}
        description={t("page_about.hero_description")}
        orientation="horizontal"
      >
        <RLImage
          src="https://cdn.rimelight.com/images/placeholder.webp"
          alt=""
          ui={{
            root: "w-full aspect-video relative block",
            trigger: "absolute inset-0 w-full h-full block",
            triggerImage: "absolute inset-0 w-full h-full object-cover rounded-lg"
          }}
        />
      </RLPageSection>

      <RLPageSection
        title={t("page_about.section_about_template_title")}
        description={t("page_about.section_about_template_description")}
        orientation="vertical"
      />

      <RLPageSection
        title={t("page_about.section_values_title")}
        description={t("page_about.section_values_description")}
        orientation="vertical"
      >
        <RLGrid>
          <RLCard
            title={t("page_about.value_dx_title")}
            description={t("page_about.value_dx_description")}
          />
          <RLCard
            title={t("page_about.value_design_title")}
            description={t("page_about.value_design_description")}
          />
          <RLCard
            title={t("page_about.value_performance_title")}
            description={t("page_about.value_performance_description")}
          />
        </RLGrid>
      </RLPageSection>
    </AppLayout>
  );
};

export default AboutPage;
