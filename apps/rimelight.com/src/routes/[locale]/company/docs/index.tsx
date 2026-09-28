import { type Component, Show } from "solid-js"
import { createAsyncData } from "#utils/async"
import DocsLayout from "#layouts/DocsLayout"
import PageRenderer from "#components/cms/PageRenderer"
import { getDocsVersions, parseDocsSlug, extractHeadingsFromBlocks } from "@rimelight/cms"
import { getLocale } from "@rimelight/i18n"
import type { TableOfContentsConfig } from "@rimelight/ui/components/table-of-contents/table-of-contents.ts"

function getLocalizedText(val: unknown, loc: string): string {
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>
    return record[loc] || record["en"] || ""
  }
  return typeof val === "string" ? val : ""
}

export const DocsIndexPage: Component = () => {
  const activeLocale = () => getLocale()

  const docsData = createAsyncData(
    () => activeLocale(),
    async (loc) => {
      try {
        const res = await fetch("/api/content/pages?type=doc")
        if (!res.ok) return { docPage: null, versions: [] }
        const data = (await res.json()) as any
        const allDocPages = (data.pages || []) as any[]

        const versions = getDocsVersions(allDocPages, loc)
        const { activeVersion, includeVersionInUrl } = parseDocsSlug(undefined, versions)

        const candidateSlugs = [
          "overview/getting-started",
          "index",
          activeVersion ? `${activeVersion}/overview/getting-started` : "overview/getting-started",
          activeVersion ? `${activeVersion}/index` : "index"
        ]

        let dbPage = null
        for (const candidate of candidateSlugs) {
          const match = allDocPages.find((p: any) => p.slug === candidate)
          if (match) {
            dbPage = match
            break
          }
        }

        return { docPage: dbPage, versions, activeVersion, includeVersionInUrl }
      } catch {
        return { docPage: null, versions: [], activeVersion: undefined, includeVersionInUrl: false }
      }
    },
    { docPage: null, versions: [], activeVersion: undefined, includeVersionInUrl: false }
  )

  const docPage = () => docsData()?.docPage
  const versions = () => docsData()?.versions || []
  const activeVersion = () => docsData()?.activeVersion
  const includeVersionInUrl = () => docsData()?.includeVersionInUrl || false

  const content = () => {
    const p = docPage()
    if (!p) return {}
    return typeof p.content === "string" ? JSON.parse(p.content) : p.content || {}
  }

  const dbBlocks = () => content().blocks || []
  const docTitle = () =>
    (docPage() ? getLocalizedText(docPage()!.title, activeLocale()) : "") || "Documentation"
  const docDescription = () =>
    (docPage() ? getLocalizedText(docPage()!.description, activeLocale()) : "") ||
    content().properties?.description ||
    ""
  const docHeadings = () => extractHeadingsFromBlocks(dbBlocks())
  const docTableOfContents = () =>
    content().properties?.tableOfContents as TableOfContentsConfig | false | undefined
  const docPrev = () => content().properties?.prev
  const docNext = () => content().properties?.next
  const docEditUrl = () => content().properties?.editUrl

  return (
    <DocsLayout
      title={docTitle()}
      description={docDescription()}
      headings={docHeadings()}
      tableOfContents={docTableOfContents()}
      prevOverride={docPrev()}
      nextOverride={docNext()}
      editUrl={docEditUrl()}
      activeVersion={activeVersion()}
      versions={versions()}
      includeVersionInUrl={includeVersionInUrl()}
    >
      <Show
        when={docPage()}
        fallback={<div class="p-12 text-center text-neutral-400">Loading documentation...</div>}
      >
        <PageRenderer blocks={dbBlocks()} locale={activeLocale()} />
      </Show>
    </DocsLayout>
  )
}

export default DocsIndexPage
