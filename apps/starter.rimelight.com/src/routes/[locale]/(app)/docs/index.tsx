import { type Component, Show, createMemo, createEffect } from "solid-js";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { extractHeadingsFromBlocks, blocksToMarkdown } from "@rimelight/cms";
import { PageRenderer } from "@rimelight/cms/solid";
import { t, getCurrentLocale } from "@rimelight/i18n";
import { useDocs } from "../docs.tsx";

export const DocsIndexPage: Component = () => {
  const activeLocale = () => getCurrentLocale();
  const docs = useDocs();

  const docData = createMemo<any>(
    async () => {
      try {
        const res = await fetch("/api/content/docs?slugs=index");
        if (!res.ok) return null;
        const data = (await res.json()) as any;
        const pageResults = (data.pages || []) as any[];
        return pageResults.find((p: any) => p.slug === "index") || null;
      } catch {
        return null;
      }
    },
    { loadingValue: null },
  );

  const title = () =>
    docData() ? t.localize(docData()!.title) || "Documentation" : "Documentation";
  const content = () => {
    const d = docData();
    if (!d) return {};
    return typeof d.content === "string" ? JSON.parse(d.content) : d.content || {};
  };
  const dbBlocks = () => content().blocks || [];
  const description = () =>
    docData() ? t.localize(docData()!.description) || content().properties?.description || "" : "";
  const headings = () => extractHeadingsFromBlocks(dbBlocks());
  const rawMarkdown = () => blocksToMarkdown(dbBlocks());

  useHead(() =>
    createSeoHead({
      title: title(),
      description: description(),
    }),
  );

  createEffect(
    () => ({
      title: title(),
      description: description(),
      headings: headings(),
      rawMarkdown: rawMarkdown(),
    }),
    (data) => {
      if (docs) {
        docs.setTitle(data.title);
        docs.setDescription(data.description);
        docs.setHeadings(data.headings);
        docs.setRawMarkdown(data.rawMarkdown);
      }
    },
  );

  return (
    <Show
      when={docData()}
      fallback={<div class="p-8 text-center text-muted">Loading documentation...</div>}
    >
      <PageRenderer blocks={dbBlocks()} locale={activeLocale()} />
    </Show>
  );
};

export default DocsIndexPage;
