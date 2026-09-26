import { type Component, Show } from "solid-js"
import { useParams } from "@solidjs/router"
import DocsLayout from "#layouts/DocsLayout"
import type { TableOfContentsConfig } from "@rimelight/ui/components/table-of-contents/table-of-contents.ts"
import {
  getDocsVersions,
  parseDocsSlug,
  extractHeadingsFromBlocks,
  blocksToMarkdown
} from "@rimelight/cms"
import PageRenderer from "#components/cms/PageRenderer"
import { createAsyncData } from "#utils/async"
import { db } from "#db"
import { pages } from "#db/schema"
import { eq, and, isNull, inArray, sql } from "drizzle-orm"
import { getLocale } from "@rimelight/i18n"

function getLocalizedText(val: unknown, loc: string): string {
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>
    return record[loc] || record["en"] || ""
  }
  return typeof val === "string" ? val : ""
}

export const DocsSlugPage: Component = () => {
  const params = useParams<{ locale: string; slug: string }>()
  const activeLocale = () => getLocale()

  const docData = createAsyncData(
    () => ({ slug: params["slug"], loc: activeLocale() }),
    async ({ slug, loc }) => {
      let allDocPages: any[] = []
      try {
        allDocPages = await db
          .select({
            slug: pages.slug,
            version: sql<string>`(${pages.content}->'properties'->>'version')`.as("version")
          })
          .from(pages)
          .where(and(eq(pages.type, "doc"), isNull(pages.deletedAt)))
      } catch {
        // DB fallback
      }

      const versions = getDocsVersions(allDocPages, loc)
      const { activeVersion, contentPath, includeVersionInUrl } = parseDocsSlug(slug, versions)

      const candidateSlugs = [
        slug,
        contentPath === "index"
          ? activeVersion
            ? `${activeVersion}/index`
            : "index"
          : activeVersion
            ? `${activeVersion}/${contentPath}`
            : contentPath,
        contentPath
      ].filter(Boolean) as string[]

      let dbPage: any = null
      try {
        const pageResults = await db
          .select()
          .from(pages)
          .where(
            and(eq(pages.type, "doc"), inArray(pages.slug, candidateSlugs), isNull(pages.deletedAt))
          )

        if (pageResults && pageResults.length > 0) {
          for (const candidate of candidateSlugs) {
            const match = pageResults.find((p: any) => p.slug === candidate)
            if (match) {
              dbPage = match
              break
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
        includeVersionInUrl
      }
    }
  )

  const dbPage = () => docData()?.dbPage
  const content = () => {
    const p = dbPage()
    if (!p) return {}
    return typeof p.content === "string" ? JSON.parse(p.content) : p.content || {}
  }
  const dbBlocks = () => content().blocks || []

  const docTitle = () =>
    dbPage()
      ? getLocalizedText(dbPage()!.title, activeLocale()) || "Documentation"
      : "Documentation"
  const docDescription = () =>
    dbPage()
      ? getLocalizedText(dbPage()!.description, activeLocale()) ||
        content().properties?.description ||
        ""
      : ""
  const docHeadings = () => extractHeadingsFromBlocks(dbBlocks())
  const docTableOfContents = () =>
    content().properties?.tableOfContents as TableOfContentsConfig | false | undefined
  const docPrev = () => content().properties?.prev
  const docNext = () => content().properties?.next
  const docEditUrl = () => content().properties?.editUrl
  const docRawMarkdown = () => blocksToMarkdown(dbBlocks())

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
  )
}

export default DocsSlugPage
