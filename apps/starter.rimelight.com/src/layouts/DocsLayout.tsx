import { type Component, type JSX, Show, createSignal, createEffect } from "solid-js"
import AppLayout from "./AppLayout"
import RLSidebar from "@rimelight/ui/components/sidebar/RLSidebar.tsx"
import RLTableOfContents from "@rimelight/ui/components/table-of-contents/RLTableOfContents.tsx"
import RLSurround from "@rimelight/ui/components/surround/RLSurround.tsx"
import RLCopyMarkdown from "@rimelight/ui/components/copy-markdown/RLCopyMarkdown.tsx"
import RLShare from "@rimelight/ui/components/share/RLShare.tsx"
import RLInput from "@rimelight/ui/components/input/RLInput.tsx"
import { getDocsSidebar, getSurroundItems } from "@rimelight/cms"
import type { TableOfContentsConfig } from "@rimelight/cms"
import docsConfig from "#config/docs.config"
import { getLocale } from "@rimelight/i18n"

export interface DocsLayoutProps {
  title: string
  description?: string | undefined
  headings?: { depth: number; slug: string; text: string }[] | undefined
  tableOfContents?: false | TableOfContentsConfig | undefined
  editUrl?: string | false | undefined
  prevOverride?: { label: string; href: string } | null | undefined
  nextOverride?: { label: string; href: string } | null | undefined
  rawMarkdown?: string | undefined
  activeVersion?: string | undefined
  versions?: string[] | undefined
  includeVersionInUrl?: boolean | undefined
  children?: JSX.Element
  session?: any
}

export const DocsLayout: Component<DocsLayoutProps> = (props) => {
  const [sidebarData, setSidebarData] = createSignal<{
    items: any[]
    scopes: any[]
    activeScope: any
  }>({
    items: [],
    scopes: [],
    activeScope: null
  })

  createEffect(
    () => ({ activeVersion: props.activeVersion, includeVersionInUrl: props.includeVersionInUrl }),
    async ({ activeVersion, includeVersionInUrl }) => {
      const locale = getLocale()
      const currentPath = typeof window !== "undefined" ? window.location.pathname : ""
      try {
        const data = await getDocsSidebar(
          docsConfig as any,
          locale,
          currentPath,
          activeVersion,
          includeVersionInUrl
        )
        setSidebarData(data)
      } catch {}
    }
  )

  const currentPath = () => (typeof window !== "undefined" ? window.location.pathname : "")
  const surround = () => getSurroundItems(sidebarData().items, currentPath())
  const prev = () => props.prevOverride ?? surround().prev
  const next = () => props.nextOverride ?? surround().next

  const globalToc = (docsConfig as any).tableOfContents ?? {
    minHeadingLevel: 2,
    maxHeadingLevel: 3
  }
  const resolvedToc = () =>
    props.tableOfContents !== undefined ? props.tableOfContents : globalToc
  const headings = () => props.headings || []
  const hasToc = () => resolvedToc() !== false && headings().length > 0

  return (
    <AppLayout title={props.title} description={props.description} session={props.session}>
      <div class="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start relative min-h-[calc(100vh-200px)]">
        {/* Sidebar column */}
        <div class="docs-sidebar-wrapper hidden lg:block w-[280px] shrink-0 sticky top-[calc(var(--rl-total-header-height,64px)+2rem)] max-h-[calc(100vh-var(--rl-total-header-height,64px)-4rem)] overflow-y-auto border-r border-default pr-0">
          <div class="mb-4 px-2">
            <RLInput
              type="text"
              placeholder="Filter navigation..."
              size="sm"
              leadingIcon="i-lucide-search"
              class="docs-sidebar-filter"
              autocomplete="off"
            />
          </div>
          <RLSidebar items={sidebarData().items} collapsible="none" class="docs-nav-sidebar" />
        </div>

        {/* Main content */}
        <main class="docs-content flex-1 min-w-0 w-full py-2">
          <div class="border-b border-default pb-4 mb-6">
            <h1 class="text-3xl font-extrabold text-highlighted tracking-tight">{props.title}</h1>
            <Show when={props.description}>
              <p class="mt-2 text-base text-muted">{props.description}</p>
            </Show>
            <div class="flex gap-2 items-center justify-end my-4">
              <Show when={props.rawMarkdown}>
                <RLCopyMarkdown raw={props.rawMarkdown!} />
              </Show>
              <RLShare />
            </div>
          </div>

          <article class="markdown-content prose max-w-none prose-base">{props.children}</article>

          <RLSurround prev={prev() ?? null} next={next() ?? null} />
        </main>

        {/* TOC right column */}
        <Show when={hasToc()}>
          <div class="hidden xl:block w-[240px] shrink-0 sticky top-[calc(var(--rl-total-header-height,64px)+2rem)] max-h-[calc(100vh-var(--rl-total-header-height,64px)-4rem)] overflow-y-auto pl-4">
            <RLTableOfContents headings={headings()} tableOfContents={resolvedToc() as any} />
          </div>
        </Show>
      </div>
    </AppLayout>
  )
}

export default DocsLayout
