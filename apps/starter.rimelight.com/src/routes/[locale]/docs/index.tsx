import { type Component, Show } from "solid-js"
import DocsLayout from "#layouts/DocsLayout"
import { extractHeadingsFromBlocks, blocksToMarkdown } from "@rimelight/cms"
import PageRenderer from "#components/cms/PageRenderer"
import { createAsyncData } from "#utils/async"
import { getLocale } from "@rimelight/i18n"

function getLocalizedText(val: unknown, loc: string): string {
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>
    return record[loc] || record["en"] || ""
  }
  return typeof val === "string" ? val : ""
}

export const DocsIndexPage: Component = () => {
  const activeLocale = () => getLocale()

  const docData = createAsyncData(
    () => true,
    async () => {
      try {
        const res = await fetch("/api/content/docs?slugs=index")
        if (!res.ok) return null
        const data = (await res.json()) as any
        const pageResults = (data.pages || []) as any[]
        return pageResults.find((p: any) => p.slug === "index") || null
      } catch {
        return null
      }
    }
  )

  const title = () =>
    docData()
      ? getLocalizedText(docData()!.title, activeLocale()) || "Documentation"
      : "Documentation"
  const content = () => {
    const d = docData()
    if (!d) return {}
    return typeof d.content === "string" ? JSON.parse(d.content) : d.content || {}
  }
  const dbBlocks = () => content().blocks || []
  const description = () =>
    docData()
      ? getLocalizedText(docData()!.description, activeLocale()) ||
        content().properties?.description ||
        ""
      : ""
  const headings = () => extractHeadingsFromBlocks(dbBlocks())
  const rawMarkdown = () => blocksToMarkdown(dbBlocks())

  return (
    <DocsLayout
      title={title()}
      description={description()}
      headings={headings()}
      rawMarkdown={rawMarkdown()}
    >
      <Show
        when={docData()}
        fallback={<div class="p-8 text-center text-muted">Loading documentation...</div>}
      >
        <PageRenderer blocks={dbBlocks()} locale={activeLocale()} />
      </Show>
    </DocsLayout>
  )
}

export default DocsIndexPage
