import { type Component, For, Show, createMemo } from "solid-js";
import { useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { t, getCurrentLocale } from "@rimelight/i18n";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx";
import { RLLink } from "@rimelight/ui/components/link/RLLink.tsx";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import { RLPost } from "@rimelight/ui/components/post/RLPost.tsx";
import type { RLButtonProps } from "@rimelight/ui/components/button/button.types.ts";
import { content, type PublicEntry } from "@rimelight/cms/solid";

/** Narrows an untyped CMS `cover` property to the `RLPost` image prop. */
const postImage = (value: unknown): string | { src: string } | undefined => {
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "src" in value &&
    typeof value.src === "string"
  ) {
    return { src: value.src };
  }
  return undefined;
};

export const HomePage: Component = () => {
  const activeLocale = () => getCurrentLocale();

  const latestPosts = createMemo<PublicEntry[]>(
    async () => (await content.entries("blog", { limit: 3, locale: activeLocale() })).entries,
    { loadingValue: [] },
  );

  const heroLinks = (): RLButtonProps[] => [
    {
      variant: "outline",
      leadingIcon: "lucide:github",
      label: t("page.home.section.hero.link.github.label"),
      href: "https://github.com/Rimelight-Entertainment/rimelight/tree/main/packages/starter.rimelight.com",
    },
    {
      variant: "solid",
      label: t("page.home.section.hero.link.use-template.label"),
      trailingIcon: "arrow-right",
      href: "/docs/",
    },
  ];

  const featureLinks = (): RLButtonProps[] => [
    {
      variant: "outline",
      label: t("page.home.section.features.link.browse-components.label"),
      href: `https://rimelight.com/${getCurrentLocale()}/company/docs/packages/rimelight-ui/components/`,
    },
    {
      label: t("page.home.section.features.link.read-the-docs.label"),
      trailingIcon: "arrow-right",
      href: "/docs",
    },
  ];

  const ctaLinks = (): RLButtonProps[] => [
    {
      variant: "outline",
      leadingIcon: "lucide:github",
      label: t("page.home.section.cta.view-on-github"),
      href: "https://github.com/Rimelight-Entertainment/rimelight",
    },
    {
      label: t("page.home.section.cta.learn-how"),
      trailingIcon: "lucide:square-arrow-out-up-right",
      href: `https://rimelight.com/${getCurrentLocale()}/company/docs/overview/contributing/introduction`,
    },
  ];

  useHead(() =>
    createPageHead({
      title: t("page.home.meta.title"),
      description: t("page.home.meta.description"),
    }),
  );

  return (
    <>
      <RLPageSection
        layout="hero"
        title={t("page.home.section.hero.title")}
        description={t("page.home.section.hero.description")}
        links={heroLinks()}
      >
        <RLLogo class="pointer-events-none h-64 w-auto" variant="logomark" />
      </RLPageSection>

      <RLPageSection
        orientation="horizontal"
        title={t("page.home.section.features.title")}
        description={t("page.home.section.features.description")}
        links={featureLinks()}
      >
        <RLImage
          src="https://cdn.rimelight.com/images/placeholder.webp"
          alt={t("page.home.placeholder-alt")}
        />
      </RLPageSection>

      <RLPageSection
        title={t("page.home.section.posts.title")}
        description={t("page.home.section.posts.description")}
      >
        <div class="flex flex-col gap-xl items-center">
          <RLGrid cols={3}>
            <For each={latestPosts()}>
              {(post) => {
                const category = post.terms?.find((x) => x.taxonomy === "category")?.label;
                const date = post.publishedAt || post.updatedAt;
                return (
                  <RLPost
                    title={t.localize(post.title)}
                    description={
                      t.localize(post.description ?? {}) || post.properties?.["excerpt"] || ""
                    }
                    date={date ? new Date(date) : undefined}
                    image={postImage(post.properties?.["cover"])}
                    badge={
                      category
                        ? typeof category === "string"
                          ? category
                          : t.localize(category as any)
                        : undefined
                    }
                    href={`/blog/${post.slug}/`}
                  />
                );
              }}
            </For>
          </RLGrid>

          <Show when={latestPosts().length > 0}>
            <RLLink
              label={t("page.home.section.posts.view.all")}
              trailingIcon="arrow-right"
              href="/blog"
            />
          </Show>
        </div>
      </RLPageSection>

      <RLPageSection
        layout="cta"
        ctaVariant="solid"
        title={t("page.home.section.cta.title")}
        description={t("page.home.section.cta.description")}
        links={ctaLinks()}
      />
    </>
  );
};

export default HomePage;
