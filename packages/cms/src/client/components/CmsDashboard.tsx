import { type Component, For, Show, createMemo, createSignal, onSettled } from "solid-js";
import { RLDashboardGroup } from "@rimelight/ui/components/dashboard-group/RLDashboardGroup.tsx";
import { RLDashboardSidebar } from "@rimelight/ui/components/dashboard-sidebar/RLDashboardSidebar.tsx";
import { RLDashboardNavbar } from "@rimelight/ui/components/dashboard-navbar/RLDashboardNavbar.tsx";
import { RLDashboardPanel } from "@rimelight/ui/components/dashboard-panel/RLDashboardPanel.tsx";
import { RLDashboardSidebarCollapse } from "@rimelight/ui/components/dashboard-sidebar-collapse/RLDashboardSidebarCollapse.tsx";
import { RLDashboardSidebarToggle } from "@rimelight/ui/components/dashboard-sidebar-toggle/RLDashboardSidebarToggle.tsx";
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

  const [stats, setStats] = createSignal<{
    totalPages: number;
    totalBylines: number;
    totalCategories: number;
    totalTags: number;
  }>({
    totalPages: 0,
    totalBylines: 0,
    totalCategories: 0,
    totalTags: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiBase()}/stats`);
      if (res.ok) {
        const data = (await res.json()) as any;
        setStats(data);
      }
    } catch (e) {
      console.error("[CmsDashboard] Failed to fetch stats:", e);
    }
  };

  onSettled(() => {
    void fetchPages();
    void fetchStats();
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

  const navGroups = [
    {
      title: "Content",
      items: [
        { id: "overview", label: "Overview", icon: "layers" },
        { id: "pages", label: "Pages", icon: "list" },
        { id: "templates", label: "Page Templates", icon: "copy" },
      ],
    },
    {
      title: "Taxonomies & Meta",
      items: [
        { id: "categories", label: "Categories", icon: "list" },
        { id: "tags", label: "Tags", icon: "star" },
        { id: "bylines", label: "Author Bylines", icon: "user" },
        { id: "taxonomies", label: "Taxonomy Manager", icon: "layers" },
      ],
    },
  ];

  const currentTitle = createMemo(() => {
    if (activeTab() === "editor") return "Visual Page Editor";
    for (const group of navGroups) {
      const found = group.items.find((i) => i.id === activeTab());
      if (found) return found.label;
    }
    return "CMS Dashboard";
  });

  const sidebarHeader = () => (
    <div class="h-16 min-h-16 flex items-center gap-3 w-full shrink-0 px-2">
      <div class="size-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
        <RLIcon name="layers" size="sm" />
      </div>
      <div class="flex-1 truncate group-data-[collapsed=true]:hidden">
        <div class="font-bold text-sm text-highlighted leading-tight">Rimelight CMS</div>
        <div class="text-[11px] text-muted leading-tight">Content Studio</div>
      </div>
      <RLDashboardSidebarCollapse
        side="left"
        class="shrink-0 group-data-[collapsed=true]:mx-auto"
      />
    </div>
  );

  const sidebarNav = () => (
    <nav class="flex flex-col gap-4 py-2 px-1">
      <For each={navGroups}>
        {(group) => (
          <div class="flex flex-col gap-1">
            <div class="px-3 pt-2 pb-1 text-[11px] font-bold text-muted uppercase tracking-wider group-data-[collapsed=true]:hidden">
              {group.title}
            </div>
            <For each={group.items}>
              {(item) => {
                const isActive = () => activeTab() === item.id;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab() === "editor" && item.id !== "editor") {
                        setSelectedPageId(null);
                      }
                      switchTab(item.id);
                      if (item.id === "pages") void fetchPages();
                    }}
                    class={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer w-full text-left group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-0 border-0 ${
                      isActive()
                        ? "bg-primary-500/10 text-primary-500 font-semibold"
                        : "bg-transparent text-default hover:text-highlighted hover:bg-neutral-100/50"
                    }`}
                  >
                    <RLIcon name={item.icon} size="sm" class="shrink-0" />
                    <span class="truncate flex-1 group-data-[collapsed=true]:hidden">
                      {item.label}
                    </span>
                  </button>
                );
              }}
            </For>
          </div>
        )}
      </For>
    </nav>
  );

  return (
    <div class="rimelight-cms-dashboard h-screen w-screen overflow-hidden bg-default text-default font-sans">
      <RLDashboardGroup>
        <RLDashboardSidebar side="left" collapsible headerSlot={sidebarHeader()}>
          {sidebarNav()}
        </RLDashboardSidebar>

        <RLDashboardPanel
          headerSlot={
            <RLDashboardNavbar title={currentTitle()} class="h-16 min-h-16 px-6">
              <div class="h-16 min-h-16 flex items-center gap-3">
                <RLDashboardSidebarToggle class="flex lg:hidden size-9 rounded-lg items-center justify-center border border-default hover:bg-muted text-toned hover:text-highlighted transition-colors shrink-0" />
                <RLDashboardSidebarCollapse side="left" class="hidden lg:flex size-9 rounded-lg" />
                <h1 class="text-lg font-bold text-highlighted truncate">{currentTitle()}</h1>
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
                <Show when={activeTab() === "pages"}>
                  <RLButton
                    variant="solid"
                    color="primary"
                    size="sm"
                    leadingIcon="i-lucide-plus"
                    onClick={() => {
                      switchTab("templates");
                    }}
                  >
                    New Page from Template
                  </RLButton>
                </Show>
              </div>
            </RLDashboardNavbar>
          }
          bodySlot={
            <div class="p-6 h-full overflow-y-auto">
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
                          {stats().totalPages || pagesList().length}
                        </span>
                        <span class="text-xs text-muted">Database pages</span>
                      </div>
                    </RLCard>

                    <RLCard class="p-5 flex flex-col justify-between gap-4 border-default bg-elevated/50">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold uppercase tracking-wider text-muted">
                          Page Templates
                        </span>
                        <div class="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                          <RLIcon name="i-lucide-layout-template" class="size-5" />
                        </div>
                      </div>
                      <div class="flex items-baseline justify-between">
                        <span class="text-3xl font-bold text-highlighted">16</span>
                        <span class="text-xs text-muted">Page type schemas</span>
                      </div>
                    </RLCard>

                    <RLCard class="p-5 flex flex-col justify-between gap-4 border-default bg-elevated/50">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold uppercase tracking-wider text-muted">
                          Categories
                        </span>
                        <div class="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                          <RLIcon name="i-lucide-folder" class="size-5" />
                        </div>
                      </div>
                      <div class="flex items-baseline justify-between">
                        <span class="text-3xl font-bold text-highlighted">
                          {stats().totalCategories}
                        </span>
                        <span class="text-xs text-muted">Topics</span>
                      </div>
                    </RLCard>

                    <RLCard class="p-5 flex flex-col justify-between gap-4 border-default bg-elevated/50">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold uppercase tracking-wider text-muted">
                          Bylines
                        </span>
                        <div class="p-2 rounded-lg bg-primary-500/10 text-primary-400">
                          <RLIcon name="i-lucide-pen-tool" class="size-5" />
                        </div>
                      </div>
                      <div class="flex items-baseline justify-between">
                        <span class="text-3xl font-bold text-highlighted">
                          {stats().totalBylines}
                        </span>
                        <span class="text-xs text-muted">Authors</span>
                      </div>
                    </RLCard>
                  </div>

                  <RLCard class="p-6 border-default bg-elevated/30">
                    <div class="flex items-center justify-between mb-4">
                      <div>
                        <h2 class="text-base font-bold text-highlighted">Recent Content Pages</h2>
                        <p class="text-xs text-muted">
                          Showing newest entries across documentation, blog, character, and lore
                        </p>
                      </div>
                      <RLButton
                        variant="subtle"
                        color="primary"
                        size="xs"
                        trailingIcon="i-lucide-arrow-right"
                        onClick={() => switchTab("pages")}
                      >
                        View all pages
                      </RLButton>
                    </div>

                    <div class="border border-default rounded-xl overflow-hidden">
                      <table class="w-full text-left text-sm">
                        <thead class="bg-muted/50 border-b border-default text-xs font-semibold text-muted uppercase">
                          <tr>
                            <th class="px-4 py-3">Title</th>
                            <th class="px-4 py-3">Slug</th>
                            <th class="px-4 py-3">Type</th>
                            <th class="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-default">
                          <For each={pagesList().slice(0, 5)}>
                            {(p) => {
                              const title =
                                typeof p.title === "object"
                                  ? p.title?.en || Object.values(p.title)[0]
                                  : p.title;
                              return (
                                <tr class="hover:bg-muted/30 transition-colors">
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
                                      variant="ghost"
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
                  </RLCard>
                </div>
              </Show>

              {/* 2. PAGES */}
              <Show when={activeTab() === "pages"}>
                <div class="max-w-7xl mx-auto flex flex-col gap-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <h2 class="text-xl font-bold text-highlighted">All Content Pages</h2>
                      <p class="text-sm text-muted">
                        Total {pagesList().length} pages found in active database branch
                      </p>
                    </div>
                    <RLButton
                      variant="outline"
                      color="neutral"
                      size="sm"
                      leadingIcon="i-lucide-refresh-cw"
                      onClick={() => void fetchPages()}
                    >
                      Refresh
                    </RLButton>
                  </div>

                  <Show
                    when={pagesList().length > 0}
                    fallback={
                      <div class="p-12 text-center rounded-2xl border border-dashed border-default bg-elevated/20">
                        <RLIcon name="i-lucide-file-text" class="size-10 text-muted mx-auto mb-3" />
                        <h3 class="text-base font-bold text-highlighted">No pages found</h3>
                        <p class="text-xs text-muted max-w-sm mx-auto mt-1">
                          No pages exist in database yet.
                        </p>
                      </div>
                    }
                  >
                    <div class="border border-default rounded-2xl overflow-hidden bg-elevated/40">
                      <table class="w-full text-left text-sm">
                        <thead class="bg-muted/50 border-b border-default text-xs font-semibold text-muted uppercase">
                          <tr>
                            <th class="px-4 py-3">Title</th>
                            <th class="px-4 py-3">Slug</th>
                            <th class="px-4 py-3">Type</th>
                            <th class="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-default">
                          <For each={pagesList()}>
                            {(p) => {
                              const title =
                                typeof p.title === "object"
                                  ? p.title?.en || Object.values(p.title)[0]
                                  : p.title;
                              return (
                                <tr class="hover:bg-muted/30 transition-colors">
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
                <div class="h-[calc(100vh-140px)] w-full border border-default rounded-2xl overflow-hidden">
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
            </div>
          }
        />
      </RLDashboardGroup>
    </div>
  );
};

export default CmsDashboard;
