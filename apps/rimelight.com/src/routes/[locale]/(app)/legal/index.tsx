import { createSeoHead } from "@rimelight/seo/head";
import { useHead } from "@solidjs/web";
import { type Component, For, Show, createMemo } from "solid-js";
import { t, getLocaleUrl, getCurrentLocale } from "@rimelight/i18n";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";
import { RLPost } from "@rimelight/ui/components/post/RLPost.tsx";
import { api } from "#api/client";

export const LegalIndexPage: Component = () => {
  const activeLocale = () => getCurrentLocale();

  const legalPages = createMemo<any[]>(
    async () => {
      const loc = activeLocale();
      try {
        const res = await (api as any).content.pages.$get({
          query: { type: "legal" },
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
        title={t("page_legal.title") || "Legal Documents"}
        description={t("page_legal.description") || "Our policies and agreements"}
        class="py-16"
      >
        <div class="max-w-5xl mx-auto w-full px-4 mt-8">
          <RLGrid cols={2}>
            <For each={legalPages() || []}>
              {(post) => {
                const content =
                  typeof post.content === "string" ? JSON.parse(post.content) : post.content || {};
                const title = t.localize(post.title);
                const description =
                  t.localize(post.description) || content.properties?.description || "";
                const postDate = post.postedAt || post.createdAt;
                return (
                  <RLPost
                    title={title}
                    description={description}
                    date={postDate}
                    to={getLocaleUrl(`/legal/${post.slug}/`)}
                    variant="ghost"
                  />
                );
              }}
            </For>
          </RLGrid>

          <Show when={!legalPages() || legalPages()!.length === 0}>
            <p class="text-center text-neutral-500 py-12">No legal documents found.</p>
          </Show>
        </div>
      </RLPageSection>
    
  );
};

export default LegalIndexPage;
