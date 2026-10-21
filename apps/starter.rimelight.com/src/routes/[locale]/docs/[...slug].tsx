import { type Component, Show, createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import DocsLayout from "#layouts/DocsLayout";
import type { TableOfContentsConfig } from "@rimelight/ui/components/table-of-contents/table-of-contents.types.ts";
import {
  getDocsVersions,
  parseDocsSlug,
  extractHeadingsFromBlocks,
  blocksToMarkdown,
} from "@rimelight/cms";
import { PageRenderer } from "@rimelight/cms/solid";
import { t, getCurrentLocale } from "@rimelight/i18n";

export const DocsSlugPage: Component = () => {
  const params = useParams<{ locale: string; slug: string }>();
  const activeLocale = () => getCurrentLocale();

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
          const pageResults = (data.pages || []) as any[];
          if (pageResults && pageResults.length > 0) {
            for (const candidate of candidateSlugs) {
              const match = pageResults.find((p: any) => p.slug === candidate);
              if (match) {
                dbPage = match;
                break;
              }
            }
          }
        }
      } catch {
        // continue
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
  const docEditUrl = () => content().properties?.editUrl;
  const docRawMarkdown = () => blocksToMarkdown(dbBlocks());

  return (
    <DocsLayout
      title={docTitle()}
      description={docDescription()}
      headings={docHeadings()}
      tableOfContents={docTableOfContents()}
      prevOverride={docPrev()}
      nextOverride={docNext()}
      editUrl={docEditUrl()}
      rawMarkdown={docRawMarkdown()}
      activeVersion={docData()?.activeVersion}
      versions={docData()?.versions}
      includeVersionInUrl={docData()?.includeVersionInUrl}
    >
      <Show
        when={dbPage()}
        fallback={<div class="p-8 text-center text-muted">Loading documentation...</div>}
      >
        <PageRenderer blocks={dbBlocks()} locale={activeLocale()} />
      </Show>
    </DocsLayout>
  );
};

export default DocsSlugPage;
