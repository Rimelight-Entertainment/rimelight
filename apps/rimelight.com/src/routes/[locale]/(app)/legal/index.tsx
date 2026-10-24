import { createSeoHead } from "@rimelight/seo/head";
import { useHead } from "@solidjs/web";
import { type Component, For, Show, createMemo } from "solid-js";
import { t, getLocaleUrl, getCurrentLocale } from "@rimelight/i18n";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";
import { RLPost } from "@rimelight/ui/components/post/RLPost.tsx";
import { content } from "@rimelight/cms/solid";

export const LegalIndexPage: Component = () => {
  const activeLocale = () => getCurrentLocale();

  const legalPages = createMemo(
    async () => {
      const loc = activeLocale();
      const { entries } = await content.entries("legal");
      return entries.filter((e) => (e.properties["locale"] ?? "en") === loc);
    },
    { loadingValue: [] },
  );

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
                const title = t.localize(post.title);
                const description = t.localize(post.description ?? undefined) || "";
                const postDate = post.publishedAt ?? undefined;
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
