import { type Component, Show, createMemo, createEffect } from "solid-js";
import { PageRenderer } from "@rimelight/cms/solid";
import {
  getDocsVersions,
  parseDocsSlug,
  extractHeadingsFromBlocks,
  blocksToMarkdown,
} from "@rimelight/cms";
import { t, getCurrentLocale } from "@rimelight/i18n";
import type { TableOfContentsConfig } from "@rimelight/ui/components/table-of-contents/table-of-contents.types.ts";
import { api } from "#api/client";
import { useDocs } from "./../docs.tsx";

export const DocsIndexPage: Component = () => {
  const activeLocale = () => getCurrentLocale();
  const docs = useDocs();

  const docsData = createMemo<any>(
    async () => {
      const loc = activeLocale();
      try {
        const res = await (api as any).content.pages.$get({
          query: { type: "doc" },
        });
        if (!res.ok) return { docPage: null, versions: [] };
        const data = (await res.json()) as any;
        const allDocPages = (data.pages || []) as any[];

        const versions = getDocsVersions(allDocPages, loc);
        const { activeVersion, includeVersionInUrl } = parseDocsSlug(undefined, versions);

        const candidateSlugs = [
          "overview/getting-started",
          "index",
          activeVersion ? `${activeVersion}/overview/getting-started` : "overview/getting-started",
          activeVersion ? `${activeVersion}/index` : "index",
        ];

        let dbPage = null;
        for (const candidate of candidateSlugs) {
          const match = allDocPages.find((p: any) => p.slug === candidate);
          if (match) {
            dbPage = match;
            break;
          }
        }

        return { docPage: dbPage, versions, activeVersion, includeVersionInUrl };
      } catch {
        return {
          docPage: null,
          versions: [],
          activeVersion: undefined,
          includeVersionInUrl: false,
        };
      }
    },
    {
      loadingValue: {
        docPage: null,
        versions: [],
        activeVersion: undefined,
        includeVersionInUrl: false,
      },
    },
  );

  const docPage = () => docsData()?.docPage;
  const activeVersion = () => docsData()?.activeVersion;
  const includeVersionInUrl = () => docsData()?.includeVersionInUrl || false;

  const content = () => {
    const p = docPage();
    if (!p) return {};
    return typeof p.content === "string" ? JSON.parse(p.content) : p.content || {};
  };

  const dbBlocks = () => content().blocks || [];
  const docTitle = () => (docPage() ? t.localize(docPage()!.title) : "") || "Documentation";
  const docDescription = () =>
    (docPage() ? t.localize(docPage()!.description) : "") ||
    content().properties?.description ||
    "";
  const docHeadings = () => extractHeadingsFromBlocks(dbBlocks());
  const docTableOfContents = () =>
    content().properties?.tableOfContents as TableOfContentsConfig | false | undefined;
  const docPrev = () => content().properties?.prev;
  const docNext = () => content().properties?.next;
  const docRawMarkdown = () => blocksToMarkdown(dbBlocks());

  createEffect(
    () => ({
      title: docTitle(),
      description: docDescription(),
      headings: docHeadings(),
      toc: docTableOfContents(),
      prev: docPrev(),
      next: docNext(),
      raw: docRawMarkdown(),
      activeVersion: activeVersion(),
      includeVersionInUrl: includeVersionInUrl(),
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
      when={docPage()}
      fallback={<div class="p-12 text-center text-neutral-400">Loading documentation...</div>}
    >
      <PageRenderer blocks={dbBlocks()} locale={activeLocale()} />
    </Show>
  );
};

export default DocsIndexPage;
