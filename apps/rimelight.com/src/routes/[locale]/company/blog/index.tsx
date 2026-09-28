import { type Component, For, Show } from "solid-js"
import { createAsyncData } from "#utils/async"
import AppLayout from "#layouts/AppLayout"
import { t, getRelativeLocaleUrl, getLocale } from "@rimelight/i18n"
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx"
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx"
import { RLPost } from "@rimelight/ui/components/post/RLPost.tsx"

function getLocalizedText(val: unknown, locale: string): string {
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>
    return record[locale] || record["en"] || ""
  }
  return typeof val === "string" ? val : ""
}

export const BlogIndexPage: Component = () => {
  const activeLocale = () => getLocale()

  const blogPosts = createAsyncData(
    () => activeLocale(),
    async (loc) => {
      try {
        const res = await fetch("/api/content/pages?type=blog")
        if (!res.ok) return []
        const data = (await res.json()) as any
        const allPages = (data.pages || []) as any[]

        return allPages.filter((post) => {
          const content =
            typeof post.content === "string" ? JSON.parse(post.content) : post.content || {}
          return (content.properties?.locale || "en") === loc
        })
      } catch {
        return []
      }
    },
    []
  )

  return (
    <AppLayout
      title={t("page_blog.meta_title") || "Blog"}
      description={t("page_blog.meta_description") || "Latest news, devlogs, and updates"}
    >
      <RLPageSection
        title={t("page_blog.section_hero_title") || "Rimelight Blog"}
        description={
          t("page_blog.section_hero_description") ||
          "News, engineering deep-dives, and announcements"
        }
        class="py-16"
      >
        <div class="max-w-7xl mx-auto w-full px-4 mt-8">
          <RLGrid cols={3}>
            <For each={blogPosts() || []}>
              {(post) => {
                const content =
                  typeof post.content === "string" ? JSON.parse(post.content) : post.content || {}
                const title = getLocalizedText(post.title, activeLocale())
                const description =
                  getLocalizedText(post.description, activeLocale()) ||
                  content.properties?.description ||
                  ""
                const heroImage = content.properties?.heroImage
                const postDate = post.postedAt || post.createdAt
                return (
                  <RLPost
                    title={title}
                    description={description}
                    date={postDate}
                    image={heroImage}
                    to={getRelativeLocaleUrl(`/company/blog/${post.slug}/`)}
                    variant="ghost"
                  />
                )
              }}
            </For>
          </RLGrid>

          <Show when={!blogPosts() || blogPosts()!.length === 0}>
            <p class="text-center text-neutral-500 py-12">No blog posts available yet.</p>
          </Show>
        </div>
      </RLPageSection>
    </AppLayout>
  )
}

export default BlogIndexPage
