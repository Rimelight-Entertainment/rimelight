import { type Component, Show, createMemo, createEffect } from "solid-js";
import { useParams } from "@solidjs/router";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import type { TableOfContentsConfig } from "@rimelight/ui/components/table-of-contents/table-of-contents.types.ts";
import {
  getDocsVersions,
  parseDocsSlug,
  extractHeadingsFromBlocks,
  blocksToMarkdown,
} from "@rimelight/cms";
import { PageRenderer } from "@rimelight/cms/solid";
import { t, getCurrentLocale } from "@rimelight/i18n";
import { useDocs } from "../docs.tsx";

export const DocsSlugPage: Component = () => {
  const params = useParams<{ locale: string; slug: string }>();
  const activeLocale = () => getCurrentLocale();
  const docs = useDocs();

  const docData = createMemo<any>(
    async () => {
      const slug = params["slug"];
      const loc = activeLocale();
      let allDocPages: any[] = [];
      try {
        const res = await fetch("/api/content/doc-versions");
        if (res.ok) {
          const data = (await res.json()) as any;
          allDocPages = (data.versions || []) as any[];
        }
      } catch {
        // DB fallback
      }

      const versions = getDocsVersions(allDocPages, loc);
      const { activeVersion, contentPath, includeVersionInUrl } = parseDocsSlug(slug, versions);

      const candidateSlugs = [
        slug,
        contentPath === "index"
          ? activeVersion
            ? `${activeVersion}/index`
            : "index"
          : activeVersion
            ? `${activeVersion}/${contentPath}`
            : contentPath,
        contentPath,
      ].filter(Boolean) as string[];

      let dbPage: any = null;
      try {
        const res = await fetch(
          `/api/content/docs?slugs=${candidateSlugs.map(encodeURIComponent).join(",")}`,
        );
        if (res.ok) {
          const data = (await res.json()) as any;
          const pages = (data.pages || []) as any[];
          for (const s of candidateSlugs) {
            const found = pages.find((p: any) => p.slug === s);
            if (found) {
              dbPage = found;
              break;
            }
          }
        }
      } catch {
        // DB fallback
      }

      return {
        dbPage,
        activeVersion,
        versions,
        includeVersionInUrl,
      };
    },
    { loadingValue: null },
  );

  const dbPage = () => docData()?.dbPage;
  const content = () => {
    const p = dbPage();
    if (!p) return {};
    return typeof p.content === "string" ? JSON.parse(p.content) : p.content || {};
  };
  const dbBlocks = () => content().blocks || [];

  const docTitle = () =>
    dbPage() ? t.localize(dbPage()!.title) || "Documentation" : "Documentation";
  const docDescription = () =>
    dbPage() ? t.localize(dbPage()!.description) || content().properties?.description || "" : "";
  const docHeadings = () => extractHeadingsFromBlocks(dbBlocks());
  const docTableOfContents = () =>
    content().properties?.tableOfContents as TableOfContentsConfig | false | undefined;
  const docPrev = () => content().properties?.prev;
  const docNext = () => content().properties?.next;
  const docRawMarkdown = () => blocksToMarkdown(dbBlocks());

  useHead(() =>
    createSeoHead({
      title: docTitle(),
      description: docDescription(),
    }),
  );

  createEffect(
    () => ({
      title: docTitle(),
      description: docDescription(),
      headings: docHeadings(),
      toc: docTableOfContents(),
      prev: docPrev(),
      next: docNext(),
      raw: docRawMarkdown(),
      activeVersion: docData()?.activeVersion,
      includeVersionInUrl: docData()?.includeVersionInUrl,
    }),
    (data) => {
      if (docs) {
        docs.setTitle(data.title);
        docs.setDescription(data.description);
        docs.setHeadings(data.headings);
        docs.setTableOfContents(data.toc);
        docs.setPrevOverride(data.prev);
        docs.setNextOverride(data.next);
        docs.setRawMarkdown(data.raw);
        docs.setActiveVersion(data.activeVersion);
        docs.setIncludeVersionInUrl(data.includeVersionInUrl);
      }
    },
  );

  return (
    <Show
      when={dbPage()}
      fallback={<div class="p-8 text-center text-muted">Loading documentation...</div>}
    >
      <PageRenderer blocks={dbBlocks()} locale={activeLocale()} />
    </Show>
  );
};

export default DocsSlugPage;
