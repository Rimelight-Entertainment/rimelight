import { useDocs } from "#routes/[locale]/(app)/company/docs.tsx";
import { createSeoHead } from "@rimelight/seo/head";
import { useHead } from "@solidjs/web";
import { type Component, Show, createMemo } from "solid-js";
import { PageRenderer } from "@rimelight/cms/solid";
import { getDocsVersions, parseDocsSlug, extractHeadingsFromBlocks } from "@rimelight/cms";
import { t, getCurrentLocale } from "@rimelight/i18n";
import type { TableOfContentsConfig } from "@rimelight/ui/components/table-of-contents/table-of-contents.types.ts";
import { api } from "#api/client";

export const DocsIndexPage: Component = () => {
  const activeLocale = () => getCurrentLocale();

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
  const versions = () => docsData()?.versions || [];
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
  const docEditUrl = () => content().properties?.editUrl;

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
