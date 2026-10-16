import { type Component, For, Show, createMemo, createSignal, onSettled } from "solid-js";
import { RLCard } from "@rimelight/ui/components/card/RLCard.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import {
  RimelightTaxonomyMasterDetail,
  RimelightTaxonomyManager,
  RimelightBylinesManager,
  RimelightTemplateEditor,
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

export const CmsDashboard: Component<CmsDashboardProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal<string>(props.initialTab || "overview");
  const [pagesList, setPagesList] = createSignal<any[]>([]);
  const [selectedPageId, setSelectedPageId] = createSignal<string | null>(null);
  const [selectedPageBlocks, setSelectedPageBlocks] = createSignal<any[]>([]);

  const apiBase = () => props.apiBase || "/api/cms";

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
    <div class="rimelight-cms-dashboard flex flex-col h-full min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      {/* Top Header */}
      <header class="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-primary-500/10 text-primary-400">
            <RLIcon name="i-lucide-box" class="size-6" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-white flex items-center gap-2">
              Rimelight CMS
              <RLBadge variant="subtle" color="primary" class="text-xs">
                Injected Dashboard
              </RLBadge>
            </h1>
            <p class="text-xs text-neutral-400">
              Manage pages, content models, bylines, and taxonomies
            </p>
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
                setActiveTab("pages");
                void fetchPages();
              }}
            >
              Back to Pages
            </RLButton>
          </Show>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div class="border-b border-neutral-800 bg-neutral-900/30 px-6">
        <nav class="flex gap-2 overflow-x-auto">
          <For each={navItems}>
            {(item) => (
              <button
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === "pages") void fetchPages();
                }}
                class={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                  activeTab() === item.id
                    ? "border-primary-500 text-primary-400 font-semibold"
                    : "border-transparent text-neutral-400 hover:text-white hover:border-neutral-700"
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
              <RLCard class="p-5 flex flex-col justify-between gap-4 border-neutral-800 bg-neutral-900/50">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Pages
                  </span>
                  <div class="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                    <RLIcon name="i-lucide-file-text" class="size-5" />
                  </div>
                </div>
                <div class="flex items-baseline justify-between">
                  <span class="text-3xl font-bold text-white">{metrics()?.totalPages ?? 0}</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("pages")}
                    class="text-xs text-primary-400 hover:underline font-medium"
                  >
                    View Pages &rarr;
                  </button>
                </div>
              </RLCard>

              <RLCard class="p-5 flex flex-col justify-between gap-4 border-neutral-800 bg-neutral-900/50">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Categories
                  </span>
                  <div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <RLIcon name="i-lucide-folder" class="size-5" />
                  </div>
                </div>
                <div class="flex items-baseline justify-between">
                  <span class="text-3xl font-bold text-white">
                    {metrics()?.totalCategories ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("categories")}
                    class="text-xs text-emerald-400 hover:underline font-medium"
                  >
                    Manage &rarr;
                  </button>
                </div>
              </RLCard>

              <RLCard class="p-5 flex flex-col justify-between gap-4 border-neutral-800 bg-neutral-900/50">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Tags
                  </span>
                  <div class="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <RLIcon name="i-lucide-tag" class="size-5" />
                  </div>
                </div>
                <div class="flex items-baseline justify-between">
                  <span class="text-3xl font-bold text-white">{metrics()?.totalTags ?? 0}</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tags")}
                    class="text-xs text-amber-400 hover:underline font-medium"
                  >
                    Manage &rarr;
                  </button>
                </div>
              </RLCard>

              <RLCard class="p-5 flex flex-col justify-between gap-4 border-neutral-800 bg-neutral-900/50">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Bylines
                  </span>
                  <div class="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <RLIcon name="i-lucide-pen-tool" class="size-5" />
                  </div>
                </div>
                <div class="flex items-baseline justify-between">
                  <span class="text-3xl font-bold text-white">{metrics()?.totalBylines ?? 0}</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("bylines")}
                    class="text-xs text-purple-400 hover:underline font-medium"
                  >
                    Manage &rarr;
                  </button>
                </div>
              </RLCard>
            </div>

            <RLCard class="p-6 border-neutral-800 bg-neutral-900/30">
              <h2 class="text-base font-semibold text-white mb-2">CMS Injection Health & Status</h2>
              <p class="text-sm text-neutral-400 mb-4">
                This dashboard is shipped directly from{" "}
                <code class="text-primary-400 font-mono">@rimelight/cms</code>. Consumer
                applications do not need custom admin code or duplicate schema forms.
              </p>
              <div class="flex flex-wrap gap-3">
                <RLButton
                  variant="solid"
                  color="primary"
                  size="sm"
                  leadingIcon="i-lucide-file-plus"
                  onClick={() => setActiveTab("pages")}
                >
                  Manage Pages
                </RLButton>
                <RLButton
                  variant="outline"
                  color="neutral"
                  size="sm"
                  leadingIcon="i-lucide-copy"
                  onClick={() => setActiveTab("templates")}
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
              <h2 class="text-xl font-bold text-white">Pages</h2>
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
                <div class="p-12 text-center text-neutral-500 border border-neutral-800 rounded-2xl bg-neutral-900/20">
                  No pages found in database. Create your first page via MCP or template seeder.
                </div>
              }
            >
              <div class="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
                <table class="w-full text-left text-sm">
                  <thead class="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th class="px-4 py-3 font-semibold">Title</th>
                      <th class="px-4 py-3 font-semibold">Slug</th>
                      <th class="px-4 py-3 font-semibold">Type</th>
                      <th class="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-neutral-800">
                    <For each={pagesList()}>
                      {(p) => {
                        const title =
                          typeof p.title === "object"
                            ? p.title.en || Object.values(p.title)[0]
                            : p.title;
                        return (
                          <tr class="hover:bg-neutral-800/40 transition-colors">
                            <td class="px-4 py-3 font-medium text-white">{title || "Untitled"}</td>
                            <td class="px-4 py-3 text-neutral-400 font-mono text-xs">{p.slug}</td>
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
          <div class="h-[calc(100vh-180px)] w-full border border-neutral-800 rounded-2xl overflow-hidden">
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

        {/* 8. TEMPLATES */}
        <Show when={activeTab() === "templates"}>
          <div class="max-w-7xl mx-auto">
            <RimelightTemplateEditor />
          </div>
        </Show>
      </main>
    </div>
  );
};

export default CmsDashboard;
