import { type Component, Show, createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import AppLayout from "#layouts/AppLayout";
import PageRenderer from "#components/cms/PageRenderer";
import { t, getCurrentLocale, getLocalizedText } from "@rimelight/i18n";

export const LegalSlugPage: Component = () => {
  const params = useParams<{ locale: string; slug: string }>();
  const activeLocale = () => getCurrentLocale();

  const pageData = createMemo<any>(
    async () => {
      const slug = params["slug"];
      if (!slug) return null;
      try {
        const res = await fetch(`/api/content/pages/${encodeURIComponent(slug)}?type=legal`);
        if (!res.ok) return null;
        const data = (await res.json()) as any;
        return data.page || null;
      } catch {
        return null;
      }
    },
    { loadingValue: null },
  );

  const title = () => (pageData() ? getLocalizedText(pageData()!.title, activeLocale()) : "Legal");
  const description = () =>
    pageData() ? getLocalizedText(pageData()!.description, activeLocale()) : "";
  const content = () => {
    const p = pageData();
    if (!p) return {};
    return typeof p.content === "string" ? JSON.parse(p.content) : p.content || {};
  };

  return (
    <AppLayout title={title()} description={description()}>
      <div class="container mx-auto px-4 py-16 max-w-3xl">
        <Show when={pageData()} fallback={<div class="p-8 text-center text-muted">Loading...</div>}>
          <article>
            <div class="prose max-w-none">
              <div class="title mb-8">
                <div class="date text-neutral-400 mb-2 text-sm">
                  <time>
                    {new Date(pageData()!.postedAt || pageData()!.createdAt).toLocaleDateString(
                      activeLocale(),
                    )}
                  </time>
                  <Show when={pageData()!.updatedAt}>
                    <div class="last-updated-on text-xs text-neutral-500 mt-1">
                      {t("legal.lastUpdatedOn")}{" "}
                      <time>
                        {new Date(pageData()!.updatedAt!).toLocaleDateString(activeLocale())}
                      </time>
                    </div>
                  </Show>
                </div>
                <h1 class="text-4xl font-extrabold text-highlighted mb-4">{title()}</h1>
                <hr class="border-default" />
              </div>
              <PageRenderer blocks={content().blocks || []} locale={activeLocale()} />
            </div>
          </article>
        </Show>
      </div>
    </AppLayout>
  );
};

export default LegalSlugPage;
