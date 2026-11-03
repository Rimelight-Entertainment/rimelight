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
      try {
        const loc = activeLocale();
        const { entries } = await content.entries("legal");
        return entries.filter((e) => (e.properties["locale"] ?? "en") === loc);
      } catch {
        return [];
      }
    },
    { loadingValue: [] },
  );

  return (
    <RLPageSection
      title={t("page.legal.meta.title")}
      description={t("page.legal.meta.description")}
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
                  {...(postDate ? { date: postDate } : {})}
                  href={getLocaleUrl(`/company/legal/${post.slug}/`)}
                  variant="ghost"
                />
              );
            }}
          </For>
        </RLGrid>

        <Show when={!legalPages() || legalPages()!.length === 0}>
          <p class="text-center text-neutral-500 py-12">{t("app.text.no-legal-documents-found")}</p>
        </Show>
      </div>
    </RLPageSection>
  );
};

export default LegalIndexPage;
