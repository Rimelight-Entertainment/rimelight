import { For, Show, createMemo, createSignal, onSettled, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useLocation, useNavigate } from "@solidjs/router";
import type { BlockDefinition } from "../core/blocks/registry";
import type { ResolvedCollection } from "../core/collections/types";
import { resolveLabel } from "../core/collections/define";
import type { CmsActor } from "../services/context";
import { createBlockRegistry } from "../solid/blocks/index";
import { BlockRegistryContext } from "../solid/BlockRenderer";
import { RichTextProvider } from "../solid/blocks/inlines";
import { RichEditingContext, type RichEditing } from "../editor/rich-context";
import { collectionColor } from "../core/collections/color";
import { createApi } from "./api";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { DashboardContext, useDashboard, type DashboardContextValue, type Toast } from "./context";
import { Overview } from "./views/Overview";
import { EntriesList } from "./views/EntriesList";
import { EntryEditor } from "./views/EntryEditor";
import { MediaLibrary } from "./views/Media";
import { Taxonomies } from "./views/Taxonomies";
import { Bylines } from "./views/Bylines";
import { Templates } from "./views/Templates";
import { Reviews } from "./views/Reviews";
import { Schemas } from "./views/Schemas";
import { Settings } from "./views/Settings";
import { cmsT } from "../locale";

export interface CmsDashboardProps {
  /** Admin API base. Default `/api/cms`. */
  apiBase?: string;
  /** Custom blocks (normally `config.blocks` from cms.config.ts). */
  blocks?: BlockDefinition<any>[];
  locales?: string[];
}

/** Splits the URL into the dashboard base (".../cms") and the in-dashboard path. */
function splitPath(pathname: string) {
  const i = pathname.search(/\/cms(\/|$)/);
  if (i === -1) return { base: "/cms", rest: "/" };
  return { base: pathname.slice(0, i + 4), rest: pathname.slice(i + 4) || "/" };
}

/**
 * The admin dashboard. Everything renders on the client only: the server and the first client
 * render both output the same empty frame, so there is nothing to mismatch during hydration.
 */
export const CmsDashboard: Component<CmsDashboardProps> = (props) => {
  const [mounted, setMounted] = createSignal(false);
  onSettled(() => {
    setMounted(true);
  });
  return (
    <div class="rimelight-cms h-dvh w-full overflow-hidden bg-default text-default">
      <Show when={mounted()} fallback={<div class="h-full w-full" aria-busy="true" />}>
        <DashboardApp {...props} />
      </Show>
    </div>
  );
};

const DashboardApp: Component<CmsDashboardProps> = (props) => {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const api = createApi(props.apiBase);
  const registry = createBlockRegistry(props.blocks ?? []);

  const [user, setUser] = createSignal<CmsActor | null>(null);
  const [authError, setAuthError] = createSignal<string | null>(null);
  const [collections, setCollections] = createSignal<ResolvedCollection[]>([]);
  const [toasts, setToasts] = createSignal<Toast[]>([]);
  const [navOpen, setNavOpen] = createSignal(false);

  const path = createMemo(() => splitPath(location.pathname));

  const reloadCollections = async () => {
    const { collections } = await api.collections.list();
    setCollections(collections);
  };

  let toastId = 0;
  const ctx: DashboardContextValue = {
    api,
    user,
    collections,
    collection: (slug) => collections().find((c) => c.slug === slug),
    reloadCollections,
    registry,
    locales: props.locales ?? ["en"],
    href: (p) => `${path().base}${p === "/" ? "" : p}`,
    navigate: (p) => {
      setNavOpen(false);
      routerNavigate(`${path().base}${p === "/" ? "" : p}`);
    },
    toast: (message, kind = "info") => {
      const id = ++toastId;
      setToasts((t) => [...t, { id, kind, message }]);
      setTimeout(
        () => setToasts((t) => t.filter((x) => x.id !== id)),
        kind === "error" ? 7000 : 3500,
      );
    },
  };

  /** Rich text editing: "@" mention search and per-collection colours / icons. */
  const richEditing: RichEditing = {
    searchMentions: async (q) => {
      const { entries } = await api.entries.list({ q: q || undefined, limit: 8 } as any);
      return entries.map((e) => ({
        entryId: e.id,
        collection: e.collection,
        slug: e.slug,
        title: resolveLabel(e.title) || e.slug,
      }));
    },
    mentionColor: (slug) => ctx.collection(slug)?.color ?? collectionColor(slug),
    mentionIcon: (slug) => ctx.collection(slug)?.icon,
    collectionLabel: (slug) => resolveLabel(ctx.collection(slug)?.label) || slug,
  };

  onSettled(() => {
    void (async () => {
      try {
        setUser((await api.me()).user);
        await reloadCollections();
      } catch (err: any) {
        setAuthError(
          err?.status === 401 ? "Sign in to use the CMS." : (err?.message ?? "Failed to load"),
        );
      }
    })();
  });

  const segments = () => path().rest.split("/").filter(Boolean);

  const view = (): JSX.Element => {
    const [first, second, third] = segments();
    switch (first) {
      case undefined:
        return <Overview />;
      case "c":
        return second ? (
          <EntriesList collection={second} create={third === "new"} />
        ) : (
          <EntriesList />
        );
      case "e":
        return <EntryEditor id={second!} />;
      case "media":
        return <MediaLibrary />;
      case "taxonomies":
        return <Taxonomies {...(second ? { taxonomy: second } : {})} />;
      case "bylines":
        return <Bylines />;
      case "templates":
        return <Templates {...(second ? { id: second } : {})} />;
      case "reviews":
        return <Reviews />;
      case "schemas":
        return <Schemas {...(second ? { slug: second } : {})} />;
      case "settings":
        return <Settings />;
      default:
        return <NotFound />;
    }
  };

  return (
    <DashboardContext value={ctx}>
      <RichEditingContext value={richEditing}>
        <RichTextProvider collections={collections()}>
          <BlockRegistryContext value={registry}>
            <Show
              when={!authError()}
              fallback={
                <div class="flex h-full items-center justify-center p-8 text-center">
                  <div class="flex max-w-sm flex-col gap-3">
                    <span class="i-lucide-lock mx-auto size-8 text-muted" />
                    <p class="text-sm text-toned">{authError()}</p>
                  </div>
                </div>
              }
            >
              <div class="flex h-full">
                <aside
                  class={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-default bg-default transition-transform lg:static lg:translate-x-0 ${navOpen() ? "translate-x-0" : "-translate-x-full"}`}
                >
                  <Sidebar active={path().rest} />
                </aside>
                <Show when={navOpen()}>
                  <button
                    type="button"
                    aria-label={cmsT("text.close-menu")}
                    class="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={() => setNavOpen(false)}
                  />
                </Show>
                <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <div class="flex h-12 shrink-0 items-center gap-2 border-b border-default px-3 lg:hidden">
                    <RLButton
                      variant="ghost"
                      color="neutral"
                      icon="i-lucide-menu"
                      aria-label={cmsT("text.open-menu")}
                      onClick={() => setNavOpen(true)}
                    />
                    <span class="text-sm font-semibold">{cmsT("text.rimelight-cms")}</span>
                  </div>
                  <div class="min-h-0 flex-1 overflow-y-auto">
                    <Show
                      when={user()}
                      fallback={
                        <div class="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted">
                          <span class="i-lucide-loader-circle size-6 animate-spin" />
                          Connecting to the CMS API… (the first load after an update runs database
                          migrations)
                        </div>
                      }
                    >
                      {view()}
                    </Show>
                  </div>
                </main>
              </div>
            </Show>
            <div class="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
              <For each={toasts()}>
                {(t) => (
                  <div
                    role="status"
                    class={`pointer-events-auto rounded-lg border px-4 py-2.5 text-sm shadow-lg ${
                      t.kind === "error"
                        ? "border-error-500/40 bg-error-500/10 text-error-600"
                        : t.kind === "success"
                          ? "border-success-500/40 bg-success-500/10 text-success-600"
                          : "border-default bg-elevated text-highlighted"
                    }`}
                  >
                    {t.message}
                  </div>
                )}
              </For>
            </div>
          </BlockRegistryContext>
        </RichTextProvider>
      </RichEditingContext>
    </DashboardContext>
  );
};

const Sidebar: Component<{ active: string }> = (props) => {
  const { href, user } = useDashboard();
  const isActive = (p: string) =>
    p === "/" ? props.active === "/" : props.active === p || props.active.startsWith(`${p}/`);

  const item = (p: string, label: string, icon: string) => (
    <RLButton
      href={href(p)}
      variant={isActive(p) ? "soft" : "ghost"}
      color={isActive(p) ? "primary" : "neutral"}
      justify="start"
      leadingIcon={icon}
      label={label}
    />
  );
  const heading = (label: string) => (
    <div class="px-2.5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted">
      {label}
    </div>
  );

  return (
    <nav class="flex h-full flex-col overflow-y-auto p-3">
      <div class="flex items-center gap-2 px-2.5 py-2">
        <span class="i-lucide-layers size-5 text-primary-500" />
        <span class="font-semibold text-highlighted">{cmsT("text.rimelight-cms")}</span>
      </div>
      {item("/", "Overview", "i-lucide-layout-dashboard")}
      {heading("Library")}
      {/* One entry point for all content; collections are filters inside it. */}
      {item("/c", "Content", "i-lucide-files")}
      {item("/media", "Media", "i-lucide-image")}
      {item("/taxonomies", "Taxonomies", "i-lucide-tags")}
      {item("/bylines", "Bylines", "i-lucide-users")}
      {heading("Workflow")}
      {item("/reviews", "Reviews", "i-lucide-check-check")}
      {heading("Configure")}
      {item("/schemas", "Collections", "i-lucide-database")}
      {item("/templates", "Templates", "i-lucide-layout-template")}
      {item("/settings", "Settings", "i-lucide-settings")}
      <div class="mt-auto flex items-center gap-2 border-t border-default px-2.5 pt-3 text-xs text-muted">
        <span class="i-lucide-circle-user size-4" />
        <span class="truncate">{user()?.name ?? "…"}</span>
      </div>
    </nav>
  );
};

const NotFound: Component = () => {
  const { href } = useDashboard();
  return (
    <div class="p-10 text-center text-sm text-muted">
      Nothing here.{" "}
      <a class="text-primary-500" href={href("/")}>
        Back to overview
      </a>
    </div>
  );
};
