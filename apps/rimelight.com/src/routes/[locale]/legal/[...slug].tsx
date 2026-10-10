import { type Component, Show, createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import AppLayout from "#layouts/AppLayout";
import { PageRenderer } from "#components/cms/PageRenderer";
import { RLDate } from "@rimelight/ui/components/date/RLDate.tsx";
import { t, getCurrentLocale } from "@rimelight/i18n";

export const LegalDocumentPage: Component = () => {
  const params = useParams<{ locale: string; slug?: string }>();
  const activeLocale = () => getCurrentLocale();

  const pageData = createMemo<any>(
    async () => {
      const slug = params.slug;
      if (!slug) return null;
      try {
        const res = await fetch(`/api/content/pages/${encodeURIComponent(slug)}?type=legal`);
        if (!res.ok) return null;
        return (await res.json()) as any;
      } catch {
        return null;
      }
    },
    { loadingValue: null },
  );

  const docBlocks = () => {
    const p = pageData();
    if (!p) return [];
    const content = typeof p.content === "string" ? JSON.parse(p.content) : p.content || {};
    return content.blocks || [];
  };

  const title = () => {
    const p = pageData();
    return p ? t.localize(p.title) || "Legal Document" : "Legal Document";
  };

  const description = () => {
    const p = pageData();
    if (!p) return "";
    const content = typeof p.content === "string" ? JSON.parse(p.content) : p.content || {};
    return t.localize(p.description) || content.properties?.description || "";
  };

  return (
    <AppLayout title={title()} description={description()}>
      <Show
        when={pageData()}
        fallback={<div class="p-16 text-center text-neutral-400">Loading document...</div>}
      >
        <article class="max-w-4xl mx-auto px-4 py-16">
          <header class="mb-12">
            <div class="text-sm text-primary-400 mb-2">
              <RLDate date={pageData()?.postedAt || pageData()?.createdAt || new Date()} />
            </div>
            <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              {title()}
            </h1>
            <p class="text-xl text-neutral-400 leading-relaxed">{description()}</p>
          </header>

          <PageRenderer blocks={docBlocks()} locale={activeLocale()} />
        </article>
      </Show>
    </AppLayout>
  );
};

export default LegalDocumentPage;
