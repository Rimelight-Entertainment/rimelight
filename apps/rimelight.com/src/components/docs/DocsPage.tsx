import { type Component, For, Show, createMemo, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
  buildDocsNav,
  blocksToMarkdown,
  content,
  extractHeadingsFromBlocks,
  switchDocsVersion,
  type PublicEntry,
} from "@rimelight/cms/solid";
import { RLSidebar } from "@rimelight/ui/components/sidebar/RLSidebar.tsx";
import { RLTableOfContents } from "@rimelight/ui/components/table-of-contents/RLTableOfContents.tsx";
import { RLSurround } from "@rimelight/ui/components/surround/RLSurround.tsx";
import { RLCopyMarkdown } from "@rimelight/ui/components/copy-markdown/RLCopyMarkdown.tsx";
import { RLShare } from "@rimelight/ui/components/share/RLShare.tsx";
import { RLHeader } from "@rimelight/ui/components/header/RLHeader.tsx";
import { RLSlideover } from "@rimelight/ui/components/slideover/RLSlideover.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { t, getCurrentLocale, getLocaleUrl } from "@rimelight/i18n";
import { DocBlocks, withDocsMeta } from "./DocBlocks";

/**
 * A docs page: version switcher + section tabs, sidebar, content and table of contents.
 *
 * Everything comes from the CMS `doc` collection. Slugs are `<version>/<section>/<…path>`
 * (e.g. `v1/website/overview/introduction`), so versions and the sidebar are derived from the
 * slugs alone — adding a `v2/…` doc adds v2 to the switcher. URLs mirror the slugs:
 * /<locale>/company/docs/v1/website/overview/introduction. With no path, the latest version's
 * first page is shown.
 */
export const DocsPage: Component<{ path?: string | undefined }> = (props) => {
  const navigate = useNavigate();
  const locale = () => getCurrentLocale();
  const basePath = () => getLocaleUrl("/company/docs").replace(/\/+$/, "");

  /** Slugs + titles of every doc (no content): enough to build versions and the sidebar. */
  const index = createMemo<PublicEntry[]>(
    async () => {
      try {
        return (await content.entries("doc", { limit: 1000, orderBy: "slug", withContent: false }))
          .entries;
      } catch {
        return [];
      }
    },
    { loadingValue: [] },
  );

  const nav = createMemo(() =>
    buildDocsNav(index(), { basePath: basePath(), urlPath: props.path, locale: locale() }),
  );

  const entry = createMemo<PublicEntry | null | undefined>(
    async () => {
      const n = nav();
      if (!n.version || !n.path) return undefined;
      const slug = (n as { slug?: string }).slug || `${n.version}/${n.path}`;
      try {
        // Folder URLs (…/contributing) are stored as …/contributing/index.
        return (
          (await content.entry("doc", slug)) ??
          (slug.endsWith("/index") ? null : await content.entry("doc", `${slug}/index`))
        );
      } catch {
        return null;
      }
    },
    { loadingValue: undefined },
  );

  const blocks = () => withDocsMeta(entry()?.blocks ?? []);
  const title = () => (entry() ? t.localize(entry()!.title) : "");
  const description = () => (entry()?.description ? t.localize(entry()!.description!) : "");
  const headings = () => extractHeadingsFromBlocks(blocks(), 2, locale());
  const markdown = () => (entry() ? blocksToMarkdown(blocks()) : "");

  const [menuOpen, setMenuOpen] = createSignal(false);
  const [tocOpen, setTocOpen] = createSignal(false);

  /** Version switcher + section tabs (desktop: above the columns; mobile: in the menu). */
  const versionBar = () => (
    <div class="mb-8 flex flex-wrap items-center gap-3 border-b border-default pb-4">
      <Show when={nav().versions.length > 0}>
        <label class="flex items-center gap-2 text-sm text-muted">
          <span class="sr-only">Docs version</span>
          <select
            class="rounded-md border border-default bg-default px-2.5 py-1.5 text-sm font-medium text-highlighted"
            value={nav().version}
            onChange={(e) =>
              navigate(
                switchDocsVersion(index(), {
                  basePath: basePath(),
                  path: nav().path,
                  target: e.currentTarget.value,
                }),
              )
            }
          >
            <For each={nav().versions}>
              {(v, i) => (
                <option value={v}>
                  {v}
                  {i() === 0 ? " (latest)" : ""}
                </option>
              )}
            </For>
          </select>
        </label>
      </Show>
      <nav aria-label="Docs sections" class="flex flex-wrap gap-1">
        <For each={nav().scopes}>
          {(s) => (
            <a
              href={s.href}
              aria-current={s.active ? "page" : undefined}
              class={`rounded-md px-3 py-1.5 text-sm transition-colors ${s.active ? "bg-primary-500/10 font-medium text-primary-400" : "text-muted hover:bg-elevated hover:text-highlighted"}`}
            >
              {s.label}
            </a>
          )}
        </For>
      </nav>
    </div>
  );

  return (
    <div class="container mx-auto px-4 py-8">
      {/* Mobile: a second sticky header with the menu (sidebar) and "On this page" (TOC). */}
      <RLHeader
        stackIndex={1}
        class="xl:hidden -mx-4 mb-6 border-b border-default bg-default/95 backdrop-blur"
        left={
          <div class="lg:hidden">
            <RLSlideover
              side="left"
              title="Documentation"
              open={menuOpen()}
              onOpenChange={setMenuOpen}
              trigger={<RLButton variant="ghost" size="sm" leadingIcon="menu" label="Menu" />}
            >
              {/* Picking a page closes the menu. */}
              <div
                class="docs-mobile-nav flex flex-col gap-4"
                onClick={(e) => (e.target as Element).closest("a[href]") && setMenuOpen(false)}
              >
                {versionBar()}
                <RLSidebar
                  items={nav().items as any}
                  collapsible="none"
                  class="w-full shadow-none border-0"
                />
              </div>
            </RLSlideover>
          </div>
        }
        right={
          <Show when={headings().length > 0}>
            <RLSlideover
              side="right"
              title="On this page"
              open={tocOpen()}
              onOpenChange={setTocOpen}
              trigger={
                <RLButton
                  variant="ghost"
                  size="sm"
                  trailingIcon="list"
                  label="On this page"
                  class="whitespace-nowrap"
                />
              }
            >
              {/* Picking a heading closes the panel. */}
              <div onClick={(e) => (e.target as Element).closest("a[href]") && setTocOpen(false)}>
                <RLTableOfContents
                  headings={headings()}
                  tableOfContents={{ minHeadingLevel: 2, maxHeadingLevel: 3 } as any}
                />
              </div>
            </RLSlideover>
          </Show>
        }
      />

      {/* Version + sections (in the mobile menu below lg) */}
      <div class="hidden lg:block">{versionBar()}</div>

      <div class="relative flex min-h-[calc(100vh-200px)] flex-col items-start gap-8 lg:flex-row">
        {/* Sections are tabs above, so the sidebar's own (empty) header area is hidden. */}
        <style>{`.docs-sidebar-wrapper [data-slot="header"],.docs-mobile-nav [data-sidebar] > [data-slot="header"]{display:none}`}</style>
        <div class="docs-sidebar-wrapper sticky top-[calc(var(--rl-header-height,64px)+2rem)] hidden max-h-[calc(100vh-var(--rl-header-height,64px)-4rem)] w-[280px] shrink-0 overflow-y-auto lg:block [&_[data-slot=header]]:hidden">
          <RLSidebar
            items={nav().items as any}
            collapsible="none"
            class="docs-nav-sidebar w-full shadow-none"
            ui={{ header: "hidden" } as any}
          />
        </div>

        <main class="docs-content w-full min-w-0 flex-1 py-2">
          <Show
            when={entry()}
            fallback={
              <Show
                when={entry() === null}
                fallback={
                  <div class="p-12 text-center text-neutral-400">Loading documentation…</div>
                }
              >
                <div class="p-12 text-center">
                  <p class="text-lg text-highlighted">
                    This page doesn't exist in {nav().version}.
                  </p>
                  <a
                    class="mt-2 inline-block text-primary-400"
                    href={`${basePath()}/${nav().version}`}
                  >
                    Go to the {nav().version} docs
                  </a>
                </div>
              </Show>
            }
          >
            <div class="mb-6 border-b border-default pb-4">
              <h1 class="text-3xl font-extrabold tracking-tight text-highlighted">{title()}</h1>
              <Show when={description()}>
                <p class="mt-2 text-base text-muted">{description()}</p>
              </Show>
              <div class="my-4 flex items-center justify-end gap-2">
                <Show when={markdown()}>
                  <RLCopyMarkdown raw={markdown()} />
                </Show>
                <RLShare />
              </div>
            </div>

            <article class="markdown-content prose prose-base max-w-none">
              <DocBlocks blocks={blocks()} locale={locale()} />
            </article>

            <RLSurround prev={nav().prev} next={nav().next} />
          </Show>
        </main>

        <Show when={headings().length > 0}>
          <div class="sticky top-[calc(var(--rl-header-height,64px)+2rem)] hidden max-h-[calc(100vh-var(--rl-header-height,64px)-4rem)] w-[240px] shrink-0 overflow-y-auto pl-4 xl:block">
            <RLTableOfContents
              headings={headings()}
              tableOfContents={{ minHeadingLevel: 2, maxHeadingLevel: 3 } as any}
            />
          </div>
        </Show>
      </div>
    </div>
  );
};

export default DocsPage;
