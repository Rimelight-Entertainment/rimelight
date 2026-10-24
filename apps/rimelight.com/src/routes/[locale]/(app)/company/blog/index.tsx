import { type Component, For, Show, createMemo } from "solid-js";
import { t, getLocaleUrl, getCurrentLocale } from "@rimelight/i18n";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";
import { RLPost } from "@rimelight/ui/components/post/RLPost.tsx";
import { api } from "#api/client";

export const BlogIndexPage: Component = () => {
  const activeLocale = () => getCurrentLocale();

  const blogPosts = createMemo<any[]>(
    async () => {
      const loc = activeLocale();
      try {
        const res = await (api as any).content.pages.$get({
          query: { type: "blog" },
        });
        if (!res.ok) return [];
        const data = (await res.json()) as any;
        const allPages = (data.pages || []) as any[];

        return allPages.filter((post: any) => {
          const content =
            typeof post.content === "string" ? JSON.parse(post.content) : post.content || {};
          return (content.properties?.locale || "en") === loc;
        });
      } catch {
        return [];
      }
    },
    { loadingValue: [] },
  );

  return (
    <RLPageSection
      title={t("page_blog.section_hero_title") || "Rimelight Blog"}
      description={
        t("page_blog.section_hero_description") || "News, engineering deep-dives, and announcements"
      }
      class="py-16"
    >
      <div class="max-w-7xl mx-auto w-full px-4 mt-8">
        <RLGrid cols={3}>
          <For each={blogPosts() || []}>
            {(post) => {
              const content =
                typeof post.content === "string" ? JSON.parse(post.content) : post.content || {};
              const title = t.localize(post.title);
              const description =
                t.localize(post.description) || content.properties?.description || "";
              const heroImage = content.properties?.heroImage;
              const postDate = post.postedAt || post.createdAt;
              return (
                <RLPost
                  title={title}
                  description={description}
                  date={postDate}
                  image={heroImage}
                  to={getLocaleUrl(`/company/blog/${post.slug}/`)}
                  variant="ghost"
                />
              );
            }}
          </For>
        </RLGrid>

        <Show when={!blogPosts() || blogPosts()!.length === 0}>
          <p class="text-center text-neutral-500 py-12">No blog posts available yet.</p>
        </Show>
      </div>
    </RLPageSection>
  );
};

export default BlogIndexPage;
