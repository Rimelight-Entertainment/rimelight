import {
  type Component,
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onSettled,
} from "solid-js";
import { Portal, useHead } from "@solidjs/web";
import { createPageHead } from "@rimelight/seo/head";
import { useNavigate } from "@solidjs/router";
import {
  BlockRenderer,
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
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { t, getCurrentLocale, getLocaleUrl } from "@rimelight/i18n";

/**
 * A docs page: version switcher + section tabs, sidebar, content and table of contents.
 *
 * Everything comes from the CMS `doc` collection. Slugs are `<version>/<section>/<…path>`
 * (e.g. `v1/website/overview/introduction`), so versions and the sidebar are derived from the
 * slugs alone — adding a `v2/…` doc adds v2 to the switcher. URLs mirror the slugs:
 * /<locale>/docs/v1/website/overview/introduction. With no path, the latest version's
 * first page is shown.
 */
export const DocsPage: Component<{ path?: string | undefined }> = (props) => {
  const navigate = useNavigate();
  const locale = () => getCurrentLocale();
  const basePath = () => getLocaleUrl("/docs").replace(/\/+$/, "");

  /** Slugs + titles of every doc (no content): enough to build versions and the sidebar. */
  const index = createMemo<PublicEntry[] | null>(
    async () => {
      try {
        return (await content.entries("doc", { limit: 1000, orderBy: "slug", withContent: false }))
          .entries;
      } catch {
        return [];
      }
    },
    { loadingValue: null },
  );

  const nav = createMemo(() =>
    buildDocsNav(index() ?? [], { basePath: basePath(), urlPath: props.path, locale: locale() }),
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

  const blocks = () => entry()?.blocks ?? [];
  const title = () => (entry() ? t.localize(entry()!.title) : "");
  const description = () => (entry()?.description ? t.localize(entry()!.description!) : "");
  const headings = () => extractHeadingsFromBlocks(blocks(), 2, locale());
  const markdown = () => (entry() ? blocksToMarkdown(blocks()) : "");

  useHead(() => createPageHead({ title: title() || "Docs", description: description() }));

  /** Which mobile panel is open under the docs sub-header. */
  const [panel, setPanel] = createSignal<"nav" | "toc" | null>(null);
  /** Viewport y of the sub-header's bottom edge — where the panels hang from. */
  const [panelTop, setPanelTop] = createSignal(0);
  const measure = () => {
    const el = document.querySelector<HTMLElement>("[data-docs-subheader]");
    if (el) setPanelTop(Math.max(0, el.getBoundingClientRect().bottom));
  };
  const toggle = (which: "nav" | "toc") => {
    measure();
    setPanel((p) => (p === which ? null : which));
  };
  /**
   * The sub-header joins the site's header stack (which pads the page for every registered
   * header), so it's only mounted below xl — hiding it with CSS would still reserve its height.
   */
  const [narrow, setNarrow] = createSignal(false);
  onSettled(() => {
    const mq = window.matchMedia("(max-width: 1279.98px)");
    const sync = () => {
      setNarrow(mq.matches);
      if (!mq.matches) setPanel(null);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  });

  onSettled(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    const onMove = () => panel() && measure();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
    };
  });
  // Navigating to another page closes any open panel.
  createEffect(
    () => props.path,
    () => {
      setPanel(null);
    },
  );

  /** Version switcher + section tabs (desktop: above the columns; mobile: in the menu). */
  const versionBar = () => (
    <div class="mb-8 flex flex-wrap items-center gap-3 border-b border-default pb-4">
      <Show when={nav().versions.length > 0}>
        <label class="flex items-center gap-2 text-sm text-muted">
          <span class="sr-only">{t("page.docs.version-label")}</span>
          <select
            class="rounded-md border border-default bg-default px-2.5 py-1.5 text-sm font-medium text-highlighted"
            value={nav().version}
            onChange={(e) =>
              navigate(
                switchDocsVersion(index() ?? [], {
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
      <nav aria-label={t("page.docs.sections-aria")} class="flex flex-wrap gap-1">
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
    <>
      {/* Mobile: a second sticky header. Left opens the sidebar, right opens "On this page";
          each panel slides down from the bottom of this header. */}
      <Show when={narrow()}>
        <RLHeader
          stackIndex={1}
          fixed
          data-docs-subheader=""
          class="w-full border-b border-default bg-default/95 backdrop-blur"
          left={
            <div class="lg:hidden">
              <RLButton
                variant="ghost"
                size="sm"
                leadingIcon="menu"
                label="Menu"
                trailingIcon={panel() === "nav" ? "chevron-up" : "chevron-down"}
                aria-expanded={panel() === "nav"}
                aria-controls="docs-panel-nav"
                onClick={() => toggle("nav")}
              />
            </div>
          }
          right={
            <Show when={headings().length > 0}>
              <RLButton
                variant="ghost"
                size="sm"
                label="On this page"
                trailingIcon={panel() === "toc" ? "chevron-up" : "chevron-down"}
                class="whitespace-nowrap"
                aria-expanded={panel() === "toc"}
                aria-controls="docs-panel-toc"
                onClick={() => toggle("toc")}
              />
            </Show>
          }
        />
      </Show>

      <Portal>
        {/* Dim the page behind an open panel; clicking it closes the panel. */}
        <div
          class={`fixed inset-x-0 bottom-0 z-30 bg-black/40 transition-opacity duration-200 xl:hidden ${panel() ? "opacity-100" : "pointer-events-none opacity-0"}`}
          style={{ top: `${panelTop()}px` }}
          onClick={() => setPanel(null)}
        />
        <For each={["nav", "toc"] as const}>
          {(which) => (
            <div
              id={`docs-panel-${which}`}
              role="region"
              aria-label={which === "nav" ? "Documentation navigation" : "On this page"}
              class={`docs-mobile-nav fixed inset-x-0 z-40 max-h-[70vh] origin-top overflow-y-auto border-b border-default bg-default px-4 py-4 shadow-xl transition-[transform,opacity] duration-200 ease-out xl:hidden ${panel() === which ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"}`}
              style={{ top: `${panelTop()}px` }}
              // Picking a page or heading closes the panel.
              onClick={(e) => (e.target as Element).closest("a[href]") && setPanel(null)}
            >
              <Show
                when={which === "nav"}
                fallback={
                  <RLTableOfContents
                    headings={headings()}
                    tableOfContents={{ minHeadingLevel: 2, maxHeadingLevel: 3 } as any}
                  />
                }
              >
                <div class="flex flex-col gap-4">
                  {versionBar()}
                  <RLSidebar
                    items={nav().items as any}
                    collapsible="none"
                    class="w-full border-0 shadow-none"
                  />
                </div>
              </Show>
            </div>
          )}
        </For>
      </Portal>

      <div class="container mx-auto px-4 py-8">
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
                    <Show
                      when={index() !== null && !nav().versions.length}
                      fallback={
                        <div class="p-12 text-center text-neutral-400">
                          {t("page.docs.loading")}
                        </div>
                      }
                    >
                      <div class="p-12 text-center">
                        <p class="text-lg text-highlighted">{t("page.docs.empty")}</p>
                        <p class="mt-2 text-neutral-400">
                          Publish entries in the <code>doc</code> collection with slugs like{" "}
                          <code>v1/guide/introduction</code>.
                        </p>
                      </div>
                    </Show>
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
                <For each={blocks()}>
                  {(b, i) => <BlockRenderer block={b} index={i()} locale={locale()} />}
                </For>
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
    </>
  );
};

export default DocsPage;
