import {
  type Component,
  Show,
  createSignal,
  createEffect,
  createContext,
  useContext,
  type Accessor,
} from "solid-js";
import type { RouteSectionProps } from "@solidjs/router";
import { RLSidebar } from "@rimelight/ui/components/sidebar/RLSidebar.tsx";
import { RLTableOfContents } from "@rimelight/ui/components/table-of-contents/RLTableOfContents.tsx";
import { RLSurround } from "@rimelight/ui/components/surround/RLSurround.tsx";
import { RLCopyMarkdown } from "@rimelight/ui/components/copy-markdown/RLCopyMarkdown.tsx";
import { RLShare } from "@rimelight/ui/components/share/RLShare.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { getDocsSidebar, getSurroundItems } from "@rimelight/cms";
import type { DocsConfig, TableOfContentsConfig } from "@rimelight/cms";
import { getCurrentLocale } from "@rimelight/i18n";

export interface DocsContextValue {
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  setHeadings: (headings: { depth: number; slug: string; text: string }[]) => void;
  setTableOfContents: (toc: false | TableOfContentsConfig | undefined) => void;
  setRawMarkdown: (raw: string | undefined) => void;
  setPrevOverride: (prev: { label: string; href: string } | null | undefined) => void;
  setNextOverride: (next: { label: string; href: string } | null | undefined) => void;
  setActiveVersion: (version: string | undefined) => void;
  setIncludeVersionInUrl: (include: boolean | undefined) => void;
}

const DocsContext = createContext<DocsContextValue>();

export function useDocs() {
  return useContext(DocsContext);
}

export const DocsRouteLayout: Component<RouteSectionProps> = (props) => {
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [headings, setHeadings] = createSignal<{ depth: number; slug: string; text: string }[]>([]);
  const [tableOfContents, setTableOfContents] = createSignal<
    false | TableOfContentsConfig | undefined
  >();
  const [rawMarkdown, setRawMarkdown] = createSignal<string | undefined>();
  const [prevOverride, setPrevOverride] = createSignal<
    { label: string; href: string } | null | undefined
  >();
  const [nextOverride, setNextOverride] = createSignal<
    { label: string; href: string } | null | undefined
  >();
  const [activeVersion, setActiveVersion] = createSignal<string | undefined>();
  const [includeVersionInUrl, setIncludeVersionInUrl] = createSignal<boolean | undefined>();

  const [sidebarData, setSidebarData] = createSignal<{
    items: any[];
    scopes: any[];
    activeScope: any;
  }>({
    items: [],
    scopes: [],
    activeScope: null,
  });

  createEffect(
    () => ({
      activeVersion: activeVersion(),
      includeVersionInUrl: includeVersionInUrl(),
    }),
    (snapshot) => {
      const { activeVersion: ver, includeVersionInUrl: inc } = snapshot;
      void (async () => {
        const locale = getCurrentLocale();
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
        let activeConfig: DocsConfig | undefined;
        try {
          const res = await fetch("/api/content/docs/nav?basePath=/{locale}/company/docs");
          if (res.ok) {
            const data = (await res.json()) as any;
            if (data?.config && data.config.sidebar?.scopes?.length > 0) {
              activeConfig = data.config;
            }
          }
        } catch {}
        try {
          const data = await getDocsSidebar(activeConfig, locale, currentPath, ver, inc);
          setSidebarData(data as { items: any[]; scopes: any[]; activeScope: any });
        } catch {}
      })();
    },
  );

  const currentPath = () => (typeof window !== "undefined" ? window.location.pathname : "");
  const surround = () => getSurroundItems(sidebarData().items, currentPath());
  const prev = () => prevOverride() ?? surround().prev;
  const next = () => nextOverride() ?? surround().next;

  const globalToc: TableOfContentsConfig = {
    minHeadingLevel: 2,
    maxHeadingLevel: 3,
  };
  const resolvedToc = () =>
    tableOfContents() !== undefined ? tableOfContents() : globalToc;
  const hasToc = () => resolvedToc() !== false && headings().length > 0;

  const contextValue: DocsContextValue = {
    setTitle,
    setDescription,
    setHeadings,
    setTableOfContents,
    setRawMarkdown,
    setPrevOverride,
    setNextOverride,
    setActiveVersion,
    setIncludeVersionInUrl,
  };

  return (
    <DocsContext.Provider value={contextValue}>
      <div class="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start relative min-h-[calc(100vh-200px)]">
        {/* Sidebar column */}
        <div class="docs-sidebar-wrapper hidden lg:block w-[280px] shrink-0 sticky top-[calc(var(--rl-header-height,64px)+2rem)] max-h-[calc(100vh-var(--rl-header-height,64px)-4rem)] overflow-y-auto border-r border-default pr-0">
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
          <Show when={title()}>
            <div class="border-b border-default pb-4 mb-6">
              <h1 class="text-3xl font-extrabold text-highlighted tracking-tight">{title()}</h1>
              <Show when={description()}>
                <p class="mt-2 text-base text-muted">{description()}</p>
              </Show>
              <div class="flex gap-2 items-center justify-end my-4">
                <Show when={rawMarkdown()}>
                  <RLCopyMarkdown raw={rawMarkdown()!} />
                </Show>
                <RLShare />
              </div>
            </div>
          </Show>

          <article class="markdown-content prose max-w-none prose-base">{props.children}</article>

          <RLSurround prev={prev() ?? null} next={next() ?? null} />
        </main>

        {/* TOC right column */}
        <Show when={hasToc()}>
          <div class="hidden xl:block w-[240px] shrink-0 sticky top-[calc(var(--rl-header-height,64px)+2rem)] max-h-[calc(100vh-var(--rl-header-height,64px)-4rem)] overflow-y-auto pl-4">
            <RLTableOfContents headings={headings()} tableOfContents={resolvedToc() as any} />
          </div>
        </Show>
      </div>
    </DocsContext.Provider>
  );
};

export default DocsRouteLayout;
