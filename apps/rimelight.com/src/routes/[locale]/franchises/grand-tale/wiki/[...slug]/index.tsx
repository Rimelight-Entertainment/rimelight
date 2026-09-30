import { type Component, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { createAsyncData } from "#utils/async";
import WikiLayout from "#layouts/WikiLayout";
import PageRenderer from "#components/cms/PageRenderer";
import { getLocale } from "@rimelight/i18n";

function getLocalizedText(val: unknown, locale: string): string {
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return typeof val === "string" ? val : "";
}

export const WikiSlugPage: Component = () => {
  const params = useParams<{ locale: string; slug?: string }>();
  const activeLocale = () => getLocale();

  const pageData = createAsyncData(
    () => params.slug,
    async (slug) => {
      if (!slug) return null;
      try {
        const lookupSlug = `franchises/grand-tale/wiki/${slug}`;
        const res = await fetch(`/api/content/pages/${encodeURIComponent(lookupSlug)}`);
        if (!res.ok) return null;
        return (await res.json()) as any;
      } catch {
        return null;
      }
    },
    null,
  );

  const title = () =>
    (pageData() ? getLocalizedText(pageData()!.title, activeLocale()) : "") || "Wiki Article";
  const description = () =>
    pageData() ? getLocalizedText(pageData()!.description, activeLocale()) : "";
  const blocks = () => {
    const p = pageData();
    if (!p) return [];
    const content = typeof p.content === "string" ? JSON.parse(p.content) : p.content || {};
    return content.blocks || [];
  };

  return (
    <WikiLayout title={`Wiki | ${title()} | Grand Tale`}>
      <Show
        when={pageData()}
        fallback={<div class="p-12 text-center text-neutral-400">Loading article...</div>}
      >
        <article class="prose dark:prose-invert max-w-4xl mx-auto py-8">
          <h1 class="text-4xl font-extrabold uppercase text-white mb-4">{title()}</h1>
          {description() && <p class="text-neutral-400 text-lg mb-8">{description()}</p>}
          <PageRenderer blocks={blocks()} locale={activeLocale()} />
        </article>
      </Show>
    </WikiLayout>
  );
};

export default WikiSlugPage;
