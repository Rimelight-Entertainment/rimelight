import { type Component, For, Show, createMemo } from "solid-js";
import type { JSX } from "@solidjs/web";
import AppLayout from "./AppLayout";
import { RLSidebar, RLTableOfContents, RLSurround, RLSelect, RLInput } from "@rimelight/ui";
import { getDocsSidebar, getSurroundItems } from "@rimelight/cms";
import type { DocsConfig, TableOfContentsConfig } from "@rimelight/cms";
import { t, getCurrentLocale } from "@rimelight/i18n";
import { api } from "#api/client";

export interface DocsLayoutProps {
  title: string;
  description?: string | undefined;
  headings?: { depth: number; slug: string; text: string }[] | undefined;
  tableOfContents?: false | TableOfContentsConfig | undefined;
  editUrl?: string | false | undefined;
  rawMarkdown?: string | undefined;
  prevOverride?: any;
  nextOverride?: any;
  activeVersion?: string | undefined;
  versions?: string[] | undefined;
  includeVersionInUrl?: boolean | undefined;
  favicon?: string | undefined;
  children?: JSX.Element | undefined;
}

export const DocsLayout: Component<DocsLayoutProps> = (props) => {
  const locale = () => getCurrentLocale();
  const currentPath = () =>
    typeof window !== "undefined" ? window.location.pathname : `/${locale()}/docs`;

  const sidebarData = createMemo<any>(
    async () => {
      const loc = locale();
      const path = currentPath();
      const v = props.activeVersion;
      const inc = props.includeVersionInUrl;
      let activeConfig: DocsConfig | undefined;
      try {
        const res = await (api as any).content["docs-config"].$get();
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data?.config && data.config.sidebar?.scopes?.length > 0) {
            activeConfig = data.config;
          }
        }
      } catch {}
      const { items, scopes, activeScope } = await getDocsSidebar(activeConfig, loc, path, v, inc);
      const { prev: sidebarPrev, next: sidebarNext } = getSurroundItems(items, path);
      return {
        sidebarItems: items,
        scopes,
        activeScope,
        prev: props.prevOverride ?? sidebarPrev ?? null,
        next: props.nextOverride ?? sidebarNext ?? null,
      };
    },
    { loadingValue: null },
  );

  const globalToc: TableOfContentsConfig = { minHeadingLevel: 2, maxHeadingLevel: 3 };
  const resolvedToc = () =>
    props.tableOfContents !== undefined ? props.tableOfContents : globalToc;
  const tocConfig = (): TableOfContentsConfig | null =>
    resolvedToc() === false ? null : (resolvedToc() as TableOfContentsConfig);
  const headings = () => props.headings || [];
  const hasToc = () => tocConfig() !== null && headings().length > 0;
  const tocHeadings = () =>
    hasToc()
      ? headings().filter((h) => {
          const cfg = tocConfig();
          return h.depth >= (cfg?.minHeadingLevel ?? 2) && h.depth <= (cfg?.maxHeadingLevel ?? 3);
        })
      : [];

  const versions = () => props.versions || [];

  const getVersionHomeUrl = (v: string) => {
    const isCompany = currentPath().includes("/company/docs");
    return isCompany ? `/${locale()}/company/docs/${v}/` : `/${locale()}/docs/${v}/`;
  };

  return (
    <AppLayout
      title={t(props.title) || props.title}
      description={props.description}
      favicon={props.favicon}
    >
      <aside class="sr-only" data-ai-agent-directive>
        This page is available in Markdown format. Markdown is recommended for AI and agentic
        consumption.
      </aside>

      <div
        class="sticky z-30 bg-neutral-50/95 backdrop-blur-sm"
        style={{ top: "var(--rl-header-height, 64px)" }}
      >
        <details id="docs-nav-details" class="lg:hidden border-b border-default docs-mobile-bar">
          <summary class="flex items-center justify-between gap-3 px-4 h-10 text-sm font-medium text-highlighted cursor-pointer select-none hover:bg-muted/40 transition-colors list-none">
            <span class="flex items-center gap-2 min-w-0">
              <span
                class={`${
                  sidebarData()?.activeScope?.icon || "i-lucide-book-open"
                } size-4 text-primary shrink-0`}
              />
              <span class="font-semibold shrink-0">
                {t(sidebarData()?.activeScope?.label || "navigation") || "Navigation"}
              </span>
              <span class="text-muted font-normal truncate hidden sm:inline">— {props.title}</span>
            </span>
            <span class="docs-nav-chevron i-lucide-chevron-down size-4 text-muted shrink-0 transition-transform duration-200" />
          </summary>
          <div class="border-t border-default/50 bg-neutral-50 max-h-[60vh] overflow-y-auto">
            <Show when={versions().length > 1}>
              <div class="flex flex-col gap-1 p-3 border-b border-default/50">
                <span class="text-[10px] text-muted font-bold uppercase tracking-wider px-1 mb-1">
                  Version
                </span>
                <RLSelect
                  items={versions().map((v) => ({ label: v, value: getVersionHomeUrl(v) }))}
                  value={getVersionHomeUrl(props.activeVersion || "")}
                  size="sm"
                  onChange={(val: any) => {
                    if (typeof window !== "undefined" && val) window.location.href = val;
                  }}
                />
              </div>
            </Show>
            <div class="p-3 border-b border-default/50">
              <RLInput
                type="text"
                placeholder={t("Filter navigation...") || "Filter navigation..."}
                size="sm"
                leadingIcon="i-lucide-search"
                class="docs-sidebar-filter"
                autocomplete="off"
              />
            </div>
            <div class="flex flex-col gap-1 p-3 border-b border-default/50">
              <span class="text-[10px] text-muted font-bold uppercase tracking-wider px-1 mb-1">
                Scopes
              </span>
              <For each={sidebarData()?.scopes || []}>
                {(scope) => (
                  <a
                    href={scope.href}
                    class={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 no-underline ${
                      scope.active
                        ? "bg-primary text-neutral-50 shadow-sm"
                        : "text-highlighted hover:bg-muted hover:text-primary"
                    }`}
                  >
                    <span class={`${scope.icon || "i-lucide-book-open"} size-3.5`} />
                    {t(scope.label)}
                  </a>
                )}
              </For>
            </div>
            <div class="p-3">
              <RLSidebar
                items={sidebarData()?.sidebarItems || []}
                t={t}
                collapsible="none"
                class="docs-nav-sidebar"
              />
            </div>
          </div>
        </details>

        <Show when={hasToc()}>
          <div class="xl:hidden border-b border-default docs-mobile-bar">
            <RLTableOfContents
              headings={tocHeadings()}
              tableOfContents={resolvedToc()}
              collapsible
            />
          </div>
        </Show>
      </div>

      <div class="docs-container max-w-[1400px] mx-auto px-4 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start relative min-h-[calc(100vh-200px)]">
        <div class="docs-sidebar-wrapper hidden lg:block w-[280px] shrink-0 sticky top-[calc(var(--rl-header-height,64px)+2rem)] max-h-[calc(100vh-var(--rl-header-height,64px)-4rem)] overflow-y-auto border-r border-default pr-0">
          <Show when={versions().length > 1}>
            <div class="mb-4 px-2">
              <label class="block text-[10px] text-muted font-bold uppercase tracking-wider mb-1.5 px-1">
                Version
              </label>
              <RLSelect
                items={versions().map((v) => ({ label: v, value: getVersionHomeUrl(v) }))}
                value={getVersionHomeUrl(props.activeVersion || "")}
                size="sm"
                onChange={(val: any) => {
                  if (typeof window !== "undefined" && val) window.location.href = val;
                }}
              />
            </div>
          </Show>
          <div class="mb-4 px-2">
            <RLInput
              type="text"
              placeholder={t("Filter navigation...") || "Filter navigation..."}
              size="sm"
              leadingIcon="i-lucide-search"
              class="docs-sidebar-filter"
              autocomplete="off"
            />
          </div>
          <div class="flex flex-col gap-1 mb-4 border-b border-default pb-4 px-2">
            <span class="text-[10px] text-muted font-bold uppercase tracking-wider mb-1.5 px-1">
              Scopes
            </span>
            <For each={sidebarData()?.scopes || []}>
              {(scope) => (
                <a
                  href={scope.href}
                  class={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 no-underline ${
                    scope.active
                      ? "bg-primary text-neutral-50 shadow-sm"
                      : "text-highlighted hover:bg-muted hover:text-primary"
                  }`}
                >
                  <span class={`${scope.icon || "i-lucide-book-open"} size-4`} />
                  {t(scope.label)}
                </a>
              )}
            </For>
          </div>
          <RLSidebar
            items={sidebarData()?.sidebarItems || []}
            t={t}
            collapsible="none"
            class="docs-nav-sidebar"
          />
        </div>

        <main class="docs-content flex-1 min-w-0 w-full py-2">
          <div class="border-b border-default pb-4 mb-6">
            <h1 class="text-3xl font-extrabold text-highlighted tracking-tight">{props.title}</h1>
            <Show when={props.description}>
              <p class="mt-2 text-base text-muted">{props.description}</p>
            </Show>
          </div>
          <article class="markdown-content prose max-w-none prose-base">{props.children}</article>
          <RLSurround prev={sidebarData()?.prev as any} next={sidebarData()?.next as any} />

          <Show when={props.editUrl}>
            <div class="mt-6 pt-4 border-t border-default">
              <a
                href={props.editUrl as string}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors no-underline"
              >
                <span class="i-lucide-pencil size-3" />
                Edit this page on GitHub
              </a>
            </div>
          </Show>
        </main>

        <Show when={hasToc()}>
          <div class="hidden xl:block w-[240px] shrink-0 sticky top-[calc(var(--rl-header-height,64px)+2rem)] max-h-[calc(100vh-var(--rl-header-height,64px)-4rem)] overflow-y-auto pl-4">
            <RLTableOfContents headings={headings()} tableOfContents={resolvedToc()} />
          </div>
        </Show>
      </div>
    </AppLayout>
  );
};

export default DocsLayout;
