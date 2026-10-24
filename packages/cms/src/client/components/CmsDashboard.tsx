import { type Component, For, Show, createMemo, createSignal, onSettled } from "solid-js";
import { RLCard } from "@rimelight/ui/components/card/RLCard.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import {
  RimelightTaxonomyMasterDetail,
  RimelightTaxonomyManager,
  RimelightBylinesManager,
  RimelightPageTypeTemplates,
  RimelightEditorLayout,
} from "../components/index";

export interface CmsDashboardProps {
  initialTab?:
    | "overview"
    | "pages"
    | "categories"
    | "tags"
    | "bylines"
    | "taxonomies"
    | "templates";
  apiBase?: string;
  routePrefix?: string;
}

const VALID_TABS = new Set([
  "overview",
  "pages",
  "categories",
  "tags",
  "bylines",
  "taxonomies",
  "templates",
]);

function resolveInitialTab(initialTab?: string): string {
  if (initialTab) return initialTab;
  if (typeof window !== "undefined") {
    const segments = window.location.pathname.replace(/\/$/, "").split("/");
    const last = segments[segments.length - 1];
    if (last && VALID_TABS.has(last)) {
      return last;
    }
  }
  return "overview";
}

export const CmsDashboard: Component<CmsDashboardProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal<string>(resolveInitialTab(props.initialTab));
  const [pagesList, setPagesList] = createSignal<any[]>([]);
  const [selectedPageId, setSelectedPageId] = createSignal<string | null>(null);
  const [selectedPageBlocks, setSelectedPageBlocks] = createSignal<any[]>([]);

  const apiBase = () => props.apiBase || "/api/cms";

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const cmsIdx = path.indexOf("/cms");
      if (cmsIdx !== -1) {
        const basePath = path.slice(0, cmsIdx + 4);
        const nextUrl = tabId === "overview" ? basePath : `${basePath}/${tabId}`;
        if (window.location.pathname !== nextUrl) {
          window.history.pushState(null, "", nextUrl);
        }
      }
    }
  };

  const fetchPages = async () => {
    try {
      const res = await fetch(`${apiBase()}/pages`);
      if (res.ok) {
        const data = (await res.json()) as any;
        setPagesList(data.pages || []);
      }
    } catch (e) {
      console.error("[CmsDashboard] Failed to fetch pages:", e);
    }
  };

  const metrics = createMemo(
    async () => {
      let totalPages = 0;
      let totalBylines = 0;
      let totalCategories = 0;
      let totalTags = 0;

      try {
        const res = await fetch(`${apiBase()}/stats`);
        if (res.ok) {
          const data = (await res.json()) as any;
          totalPages = data.totalPages ?? 0;
          totalBylines = data.totalBylines ?? 0;
          totalCategories = data.totalCategories ?? 0;
          totalTags = data.totalTags ?? 0;
        }
      } catch {}

      return {
        totalPages,
        totalBylines,
        totalCategories,
        totalTags,
      };
    },
    { loadingValue: { totalPages: 0, totalBylines: 0, totalCategories: 0, totalTags: 0 } },
  );

  onSettled(() => {
    void fetchPages();
  });

  const openEditor = async (page: any) => {
    try {
      const res = await fetch(`${apiBase()}/pages/${page.id}`);
      if (res.ok) {
        const data = (await res.json()) as any;
        const pageContent = data.draft?.content || data.page?.content || {};
        setSelectedPageBlocks(pageContent.blocks || []);
        setSelectedPageId(page.id);
        setActiveTab("editor");
      }
    } catch (e) {
      console.error("[CmsDashboard] Failed to open editor:", e);
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: "i-lucide-layout-dashboard" },
    { id: "pages", label: "Pages", icon: "i-lucide-file-text" },
    { id: "categories", label: "Categories", icon: "i-lucide-folder" },
    { id: "tags", label: "Tags", icon: "i-lucide-tag" },
    { id: "bylines", label: "Author Bylines", icon: "i-lucide-pen-tool" },
    { id: "taxonomies", label: "Taxonomies", icon: "i-lucide-folder-tree" },
    { id: "templates", label: "Templates", icon: "i-lucide-copy" },
  ];

  return (
    <div class="rimelight-cms-dashboard flex flex-col h-full min-h-screen bg-default text-default font-sans">
      {/* Top Header */}
      <header class="border-b border-default bg-elevated/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-primary-500/10 text-primary-400">
            <RLIcon name="i-lucide-box" class="size-6" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-highlighted flex items-center gap-2">
              Rimelight CMS
              <RLBadge variant="subtle" color="primary" class="text-xs">
                Injected Dashboard
              </RLBadge>
            </h1>
            <p class="text-xs text-muted">Manage pages, content models, bylines, and taxonomies</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Show when={activeTab() === "editor"}>
            <RLButton
              variant="outline"
              color="neutral"
              size="sm"
              leadingIcon="i-lucide-arrow-left"
              onClick={() => {
                setSelectedPageId(null);
                switchTab("pages");
                void fetchPages();
              }}
            >
              Back to Pages
            </RLButton>
          </Show>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div class="border-b border-default bg-elevated/30 px-6">
        <nav class="flex gap-2 overflow-x-auto">
          <For each={navItems}>
            {(item) => (
              <button
                type="button"
                onClick={() => {
                  switchTab(item.id);
                  if (item.id === "pages") void fetchPages();
                }}
                class={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab() === item.id
                    ? "border-primary-500 text-primary-500 font-semibold"
                    : "border-transparent text-muted hover:text-highlighted hover:border-default"
                }`}
              >
                <RLIcon name={item.icon} class="size-4" />
                <span>{item.label}</span>
              </button>
            )}
          </For>
        </nav>
      </div>

      {/* Main Content Viewport */}
      <main class="flex-1 p-6 overflow-y-auto">
        {/* 1. OVERVIEW */}
        <Show when={activeTab() === "overview"}>
          <div class="max-w-7xl mx-auto flex flex-col gap-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <RLCard class="p-5 flex flex-col justify-between gap-4 border-default bg-elevated/50">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold uppercase tracking-wider text-muted">
                    Pages
                  </span>
                  <div class="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                    <RLIcon name="i-lucide-file-text" class="size-5" />
                  </div>
                </div>
                <div class="flex items-baseline justify-between">
                  <span class="text-3xl font-bold text-highlighted">
                    {metrics()?.totalPages ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => switchTab("pages")}
                    class="text-xs text-primary-500 hover:underline font-medium cursor-pointer"
                  >
                    View Pages &rarr;
                  </button>
                </div>
              </RLCard>

              <RLCard class="p-5 flex flex-col justify-between gap-4 border-default bg-elevated/50">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold uppercase tracking-wider text-muted">
                    Categories
                  </span>
                  <div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <RLIcon name="i-lucide-folder" class="size-5" />
                  </div>
                </div>
                <div class="flex items-baseline justify-between">
                  <span class="text-3xl font-bold text-highlighted">
                    {metrics()?.totalCategories ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => switchTab("categories")}
                    class="text-xs text-emerald-500 hover:underline font-medium cursor-pointer"
                  >
                    Manage &rarr;
                  </button>
                </div>
              </RLCard>

              <RLCard class="p-5 flex flex-col justify-between gap-4 border-default bg-elevated/50">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold uppercase tracking-wider text-muted">
                    Tags
                  </span>
                  <div class="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <RLIcon name="i-lucide-tag" class="size-5" />
                  </div>
                </div>
                <div class="flex items-baseline justify-between">
                  <span class="text-3xl font-bold text-highlighted">
                    {metrics()?.totalTags ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => switchTab("tags")}
                    class="text-xs text-amber-500 hover:underline font-medium cursor-pointer"
                  >
                    Manage &rarr;
                  </button>
                </div>
              </RLCard>

              <RLCard class="p-5 flex flex-col justify-between gap-4 border-default bg-elevated/50">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold uppercase tracking-wider text-muted">
                    Bylines
                  </span>
                  <div class="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <RLIcon name="i-lucide-pen-tool" class="size-5" />
                  </div>
                </div>
                <div class="flex items-baseline justify-between">
                  <span class="text-3xl font-bold text-highlighted">
                    {metrics()?.totalBylines ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => switchTab("bylines")}
                    class="text-xs text-purple-500 hover:underline font-medium cursor-pointer"
                  >
                    Manage &rarr;
                  </button>
                </div>
              </RLCard>
            </div>

            <RLCard class="p-6 border-default bg-elevated/30">
              <h2 class="text-base font-semibold text-highlighted mb-2">
                CMS Injection Health & Status
              </h2>
              <p class="text-sm text-muted mb-4">
                This dashboard is shipped directly from{" "}
                <code class="text-primary-500 font-mono">@rimelight/cms</code>. Consumer
                applications do not need custom admin code or duplicate schema forms.
              </p>
              <div class="flex flex-wrap gap-3">
                <RLButton
                  variant="solid"
                  color="primary"
                  size="sm"
                  leadingIcon="i-lucide-file-plus"
                  onClick={() => switchTab("pages")}
                >
                  Manage Pages
                </RLButton>
                <RLButton
                  variant="outline"
                  color="neutral"
                  size="sm"
                  leadingIcon="i-lucide-copy"
                  onClick={() => switchTab("templates")}
                >
                  Edit Templates
                </RLButton>
              </div>
            </RLCard>
          </div>
        </Show>

        {/* 2. PAGES */}
        <Show when={activeTab() === "pages"}>
          <div class="max-w-7xl mx-auto flex flex-col gap-4">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-xl font-bold text-highlighted">Pages</h2>
              <RLButton
                variant="solid"
                color="primary"
                size="sm"
                leadingIcon="i-lucide-refresh-cw"
                onClick={fetchPages}
              >
                Refresh
              </RLButton>
            </div>

            <Show
              when={pagesList().length > 0}
              fallback={
                <div class="p-12 text-center text-muted border border-default rounded-2xl bg-elevated/20">
                  No pages found in database. Create your first page via MCP or template seeder.
                </div>
              }
            >
              <div class="border border-default rounded-xl overflow-hidden bg-elevated/40">
                <table class="w-full text-left text-sm">
                  <thead class="bg-elevated/80 text-muted border-b border-default">
                    <tr>
                      <th class="px-4 py-3 font-semibold">Title</th>
                      <th class="px-4 py-3 font-semibold">Slug</th>
                      <th class="px-4 py-3 font-semibold">Type</th>
                      <th class="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-default">
                    <For each={pagesList()}>
                      {(p) => {
                        const title =
                          typeof p.title === "object"
                            ? p.title.en || Object.values(p.title)[0]
                            : p.title;
                        return (
                          <tr class="hover:bg-elevated/60 transition-colors">
                            <td class="px-4 py-3 font-medium text-highlighted">
                              {title || "Untitled"}
                            </td>
                            <td class="px-4 py-3 text-muted font-mono text-xs">{p.slug}</td>
                            <td class="px-4 py-3">
                              <RLBadge variant="subtle" color="neutral" class="text-xs">
                                {p.type || "page"}
                              </RLBadge>
                            </td>
                            <td class="px-4 py-3 text-right">
                              <RLButton
                                variant="outline"
                                color="primary"
                                size="xs"
                                leadingIcon="i-lucide-pen"
                                onClick={() => openEditor(p)}
                              >
                                Edit
                              </RLButton>
                            </td>
                          </tr>
                        );
                      }}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </div>
        </Show>

        {/* 3. VISUAL EDITOR */}
        <Show when={activeTab() === "editor" && selectedPageId()}>
          <div class="h-[calc(100vh-180px)] w-full border border-default rounded-2xl overflow-hidden">
            <RimelightEditorLayout
              pageId={selectedPageId()!}
              initialBlocks={selectedPageBlocks()}
              showInternalPreview={true}
            />
          </div>
        </Show>

        {/* 4. CATEGORIES */}
        <Show when={activeTab() === "categories"}>
          <div class="max-w-7xl mx-auto">
            <RimelightTaxonomyMasterDetail
              taxonomy="category"
              title="Categories"
              description="Organize your content into hierarchical topics and sections."
            />
          </div>
        </Show>

        {/* 5. TAGS */}
        <Show when={activeTab() === "tags"}>
          <div class="max-w-7xl mx-auto">
            <RimelightTaxonomyMasterDetail
              taxonomy="tag"
              title="Tags"
              description="Label articles and posts with keywords for easy filtering."
            />
          </div>
        </Show>

        {/* 6. BYLINES */}
        <Show when={activeTab() === "bylines"}>
          <div class="max-w-7xl mx-auto">
            <RimelightBylinesManager />
          </div>
        </Show>

        {/* 7. TAXONOMIES */}
        <Show when={activeTab() === "taxonomies"}>
          <div class="max-w-6xl mx-auto">
            <RimelightTaxonomyManager initialTaxonomy="category" />
          </div>
        </Show>

        {/* 8. PAGE TYPE TEMPLATES */}
        <Show when={activeTab() === "templates"}>
          <div class="max-w-7xl mx-auto">
            <RimelightPageTypeTemplates />
          </div>
        </Show>
      </main>
    </div>
  );
};

export default CmsDashboard;
