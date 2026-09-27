import { type Component, For, Show } from "solid-js"
import { createAsyncData } from "#utils/async"
import AppLayout from "#layouts/AppLayout"
import { t, getLocale, getRelativeLocaleUrl } from "@rimelight/i18n"
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx"
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx"
import { RLLink } from "@rimelight/ui/components/link/RLLink.tsx"
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx"
import { RLPost } from "@rimelight/ui/components/post/RLPost.tsx"
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx"
import type { ButtonProps } from "@rimelight/ui/components/button/button.ts"

function getLocalizedText(val: unknown, locale: string): string {
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>
    return record[locale] || record["en"] || ""
  }
  return typeof val === "string" ? val : ""
}

export const HomePage: Component = () => {
  const activeLocale = () => getLocale()

  const latestPosts = createAsyncData(
    () => activeLocale(),
    async (loc) => {
      try {
        const res = await fetch("/api/content/pages?type=blog")
        if (!res.ok) return []
        const data = (await res.json()) as any
        const blogPages = (data.pages || []) as any[]

        return blogPages
          .filter((post) => {
            const content =
              typeof post.content === "string" ? JSON.parse(post.content) : post.content || {}
            return (content.properties?.locale || "en") === loc
          })
          .slice(0, 3)
      } catch {
        return []
      }
    },
    []
  )

  const heroLinks = (): ButtonProps[] => [
    {
      variant: "outline",
      leadingIcon: "i-lucide-github",
      label: t("page_home.section_hero_link_github_label"),
      href: "https://github.com/Rimelight-Entertainment/rimelight/tree/main/packages/starter.rimelight.com"
    },
    {
      variant: "solid",
      label: t("page_home.section_hero_link_use-template_label"),
      trailingIcon: "i-lucide-arrow-right",
      href: getRelativeLocaleUrl("/docs/")
    }
  ]

  const featureLinks = (): ButtonProps[] => [
    {
      variant: "outline",
      label: t("page_home.section_features_link_browse-components_label"),
      href: `https://rimelight.com/${getLocale()}/company/docs/packages/rimelight-ui/components/`
    },
    {
      label: t("page_home.section_features_link_read-the-docs_label"),
      trailingIcon: "i-lucide-arrow-right",
      href: "/docs"
    }
  ]

  const ctaLinks = (): ButtonProps[] => [
    {
      variant: "outline",
      leadingIcon: "i-lucide-github",
      label: t("page_home.section_cta_view-on-github"),
      href: "https://github.com/Rimelight-Entertainment/rimelight"
    },
    {
      label: t("page_home.section_cta_learn-how"),
      trailingIcon: "i-lucide-square-arrow-out-up-right",
      href: `https://rimelight.com/${getLocale()}/company/docs/overview/contributing/introduction`
    }
  ]

  return (
    <AppLayout title={t("page_home.meta_title")} description={t("page_home.meta_description")}>
      <RLPageSection
        variant="hero"
        title={t("page_home.section_hero_title")}
        description={t("page_home.section_hero_description")}
        links={heroLinks()}
      >
        <RLLogo class="pointer-events-none h-64 w-auto" variant="logomark" />
      </RLPageSection>

      <RLPageSection
        orientation="horizontal"
        title={t("page_home.section_features_title")}
        description={t("page_home.section_features_description")}
        links={featureLinks()}
      >
        <RLImage src="https://cdn.rimelight.com/images/placeholder.webp" alt="Placeholder Image" />
      </RLPageSection>

      <RLPageSection
        title={t("page_home.section_posts_title")}
        description={t("page_home.section_posts_description")}
      >
        <div class="flex flex-col gap-xl items-center">
          <RLGrid cols={3}>
            <For each={latestPosts() || []}>
              {(post) => {
                const content =
                  typeof post.content === "string" ? JSON.parse(post.content) : post.content || {}
                const title = getLocalizedText(post.title, activeLocale())
                const description = content.properties?.description || ""
                const heroImage = content.properties?.heroImage
                const postDate = post.postedAt || post.createdAt
                return (
                  <RLPost
                    variant="ghost"
                    image={heroImage}
                    title={title}
                    description={description}
                    date={postDate}
                    to={getRelativeLocaleUrl(`/blog/${post.slug}/`)}
                  />
                )
              }}
            </For>
          </RLGrid>

          <Show when={(latestPosts() || []).length > 0}>
            <RLLink
              label={t("page_home.section_posts_view_all")}
              trailingIcon="i-lucide-arrow-right"
              href={getRelativeLocaleUrl("/blog")}
            />
          </Show>
        </div>
      </RLPageSection>

      <RLPageSection
        variant="cta"
        ctaVariant="solid"
        title={t("page_home.section_cta_title")}
        description={t("page_home.section_cta_description")}
        links={ctaLinks()}
      />
    </AppLayout>
  )
}

export default HomePage
