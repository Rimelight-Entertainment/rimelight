import { type Component, For, Show, createMemo } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { t, getCurrentLocale, getLocaleUrl } from "@rimelight/i18n";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx";
import { RLLink } from "@rimelight/ui/components/link/RLLink.tsx";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";
import { RLPost } from "@rimelight/ui/components/post/RLPost.tsx";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import type { RLButtonProps } from "@rimelight/ui/components/button/button.types.ts";

export const HomePage: Component = () => {
  const activeLocale = () => getCurrentLocale();

  const latestPosts = createMemo<any[]>(
    async () => {
      const loc = activeLocale();
      try {
        const res = await fetch("/api/content/pages?type=blog");
        if (!res.ok) return [];
        const data = (await res.json()) as any;
        const blogPages = (data.pages || []) as any[];

        return blogPages
          .filter((post) => {
            const content =
              typeof post.content === "string" ? JSON.parse(post.content) : post.content || {};
            return (content.properties?.locale || "en") === loc;
          })
          .slice(0, 3);
      } catch {
        return [];
      }
    },
    { loadingValue: [] },
  );

  const heroLinks = (): RLButtonProps[] => [
    {
      variant: "outline",
      leadingIcon: "i-lucide-github",
      label: t("page.home.section.hero.link.github.label"),
      href: "https://github.com/Rimelight-Entertainment/rimelight/tree/main/packages/starter.rimelight.com",
    },
    {
      variant: "solid",
      label: t("page.home.section.hero.link.use-template.label"),
      trailingIcon: "i-lucide-arrow-right",
      href: getLocaleUrl("/docs/"),
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
      trailingIcon: "i-lucide-arrow-right",
      href: "/docs",
    },
  ];

  const ctaLinks = (): RLButtonProps[] => [
    {
      variant: "outline",
      leadingIcon: "i-lucide-github",
      label: t("page.home.section.cta.view-on-github"),
      href: "https://github.com/Rimelight-Entertainment/rimelight",
    },
    {
      label: t("page.home.section.cta.learn-how"),
      trailingIcon: "i-lucide-square-arrow-out-up-right",
      href: `https://rimelight.com/${getCurrentLocale()}/company/docs/overview/contributing/introduction`,
    },
  ];

  useHead(() =>
    createSeoHead({
      title: t("page.home.meta.title"),
      description: t("page.home.meta.description"),
    }),
  );

  return (
    <>
      <RLPageSection
        variant="hero"
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
        <RLImage src="https://cdn.rimelight.com/images/placeholder.webp" alt="Placeholder Image" />
      </RLPageSection>

      <RLPageSection
        title={t("page.home.section.posts.title")}
        description={t("page.home.section.posts.description")}
      >
        <div class="flex flex-col gap-xl items-center">
          <RLGrid cols={3}>
            <For each={latestPosts() || []}>
              {(post) => {
                const content =
                  typeof post.content === "string" ? JSON.parse(post.content) : post.content || {};
                const title = t.localize(post.title);
                const description = content.properties?.description || "";
                const heroImage = content.properties?.heroImage;
                const postDate = post.postedAt || post.createdAt;
                return (
                  <RLPost
                    variant="ghost"
                    image={heroImage}
                    title={title}
                    description={description}
                    date={postDate}
                    to={getLocaleUrl(`/blog/${post.slug}/`)}
                  />
                );
              }}
            </For>
          </RLGrid>

          <Show when={(latestPosts() || []).length > 0}>
            <RLLink
              label={t("page.home.section.posts.view.all")}
              trailingIcon="i-lucide-arrow-right"
              href={getLocaleUrl("/blog")}
            />
          </Show>
        </div>
      </RLPageSection>

      <RLPageSection
        variant="cta"
        ctaVariant="solid"
        title={t("page.home.section.cta.title")}
        description={t("page.home.section.cta.description")}
        links={ctaLinks()}
      />
    </>
  );
};

export default HomePage;
