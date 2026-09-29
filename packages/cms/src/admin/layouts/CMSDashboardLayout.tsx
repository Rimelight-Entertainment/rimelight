import { For, Show, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import { RLDashboardGroup } from "@rimelight/ui/components/dashboard-group/RLDashboardGroup.tsx"
import { RLDashboardSidebar } from "@rimelight/ui/components/dashboard-sidebar/RLDashboardSidebar.tsx"
import { RLDashboardNavbar } from "@rimelight/ui/components/dashboard-navbar/RLDashboardNavbar.tsx"
import { RLDashboardPanel } from "@rimelight/ui/components/dashboard-panel/RLDashboardPanel.tsx"
import { RLDashboardToolbar } from "@rimelight/ui/components/dashboard-toolbar/RLDashboardToolbar.tsx"
import { RLDashboardSidebarCollapse } from "@rimelight/ui/components/dashboard-sidebar-collapse/RLDashboardSidebarCollapse.tsx"
import { RLDashboardSidebarToggle } from "@rimelight/ui/components/dashboard-sidebar-toggle/RLDashboardSidebarToggle.tsx"
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx"
import "../../client/styles/cms-editor.css"

export interface CmsNavItem {
  icon: string
  label: string
  href: string
  id: string
}

export interface CmsNavGroup {
  title: string
  items: CmsNavItem[]
}

export interface CMSDashboardLayoutProps {
  title: string
  description?: string | undefined
  activeSection?: string | undefined
  locale?: string | undefined
  /**
   * Base path for CMS routes, e.g. "/en/cms". Defaults to "/cms".
   */
  basePath?: string | undefined
  navigationGroups?: CmsNavGroup[] | undefined
  toolbarLeft?: JSX.Element | undefined
  toolbarRight?: JSX.Element | undefined
  children?: JSX.Element | undefined
}

function defaultNav(basePath: string): {
  dashboard: CmsNavItem
  groups: CmsNavGroup[]
  settings: CmsNavItem
} {
  return {
    dashboard: {
      icon: "i-lucide-layout-dashboard",
      label: "Dashboard",
      href: basePath,
      id: "dashboard"
    },
    groups: [
      {
        title: "Collections",
        items: [
          { icon: "i-lucide-file-text", label: "Pages", href: `${basePath}/pages`, id: "pages" },
          {
            icon: "i-lucide-layout-template",
            label: "Templates",
            href: `${basePath}/templates`,
            id: "templates"
          }
        ]
      },
      {
        title: "Manage",
        items: [
          { icon: "i-lucide-image", label: "Assets", href: `${basePath}/assets`, id: "assets" },
          {
            icon: "i-lucide-folder",
            label: "Categories",
            href: `${basePath}/categories`,
            id: "categories"
          },
          { icon: "i-lucide-tag", label: "Tags", href: `${basePath}/tags`, id: "tags" },
          {
            icon: "i-lucide-pen-tool",
            label: "Bylines",
            href: `${basePath}/bylines`,
            id: "bylines"
          },
          {
            icon: "i-lucide-git-branch",
            label: "Versions",
            href: `${basePath}/versions`,
            id: "versions"
          }
        ]
      },
      {
        title: "Admin",
        items: [
          {
            icon: "i-lucide-database",
            label: "Content Types",
            href: `${basePath}/content-types`,
            id: "content-types"
          },
          {
            icon: "i-lucide-file-cog",
            label: "Byline Schema",
            href: `${basePath}/byline-schema`,
            id: "byline-schema"
          },
          { icon: "i-lucide-users", label: "Users", href: `${basePath}/users`, id: "users" }
        ]
      }
    ],
    settings: {
      icon: "i-lucide-settings",
      label: "Settings",
      href: `${basePath}/settings`,
      id: "settings"
    }
  }
}

/**
 * CMS admin dashboard shell (Solid). Authentication is handled by the host app — wrap this layout
 * in the host's auth guard (e.g. redirect to `/auth/sign-in` when no session exists).
 */
export const CMSDashboardLayout: Component<CMSDashboardLayoutProps> = (props) => {
  const basePath = () => props.basePath ?? "/cms"
  const nav = () => defaultNav(basePath())
  const activeSection = () => props.activeSection ?? "dashboard"
  const description = () => props.description ?? "Content Management System"

  const navLinkClass = (id: string) =>
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-0 " +
    (id === activeSection()
      ? "bg-muted text-highlighted font-semibold"
      : "text-default hover:text-highlighted hover:bg-muted")

  const sidebarHeader = () => (
    <div
      class="h-16 min-h-16 flex items-center gap-3 w-full shrink-0"
      style={{
        "height": "4rem",
        "min-height": "4rem",
        "display": "flex",
        "align-items": "center",
        "gap": "0.75rem"
      }}
    >
      <RLIcon
        name="i-lucide-shield"
        class="size-6 text-primary shrink-0 group-data-[collapsed=true]:hidden"
      />
      <span class="font-semibold text-highlighted truncate flex-1 transition-opacity duration-200 group-data-[collapsed=true]:hidden">
        CMS Admin
      </span>
      <RLDashboardSidebarCollapse
        side="left"
        class="shrink-0 group-data-[collapsed=true]:mx-auto"
      />
    </div>
  )

  const sidebarNav = () => (
    <nav class="flex flex-col gap-4 py-2">
      <a href={nav().dashboard.href} class={navLinkClass(nav().dashboard.id)}>
        <RLIcon name={nav().dashboard.icon} class="size-5 shrink-0" />
        <span class="truncate flex-1 group-data-[collapsed=true]:hidden">
          {nav().dashboard.label}
        </span>
      </a>

      <hr class="border-t border-default/60 mx-3 my-1 group-data-[collapsed=true]:hidden" />

      <For each={props.navigationGroups ?? nav().groups}>
        {(group) => (
          <div class="flex flex-col gap-1">
            <div class="px-3 pt-2 pb-1 text-xs font-semibold text-muted uppercase tracking-wider group-data-[collapsed=true]:hidden">
              {group.title}
            </div>
            <hr class="border-t border-default/40 mx-3 mb-1.5 group-data-[collapsed=true]:hidden" />
            <For each={group.items}>
              {(item) => (
                <a href={item.href} class={navLinkClass(item.id)}>
                  <RLIcon name={item.icon} class="size-5 shrink-0" />
                  <span class="truncate flex-1 group-data-[collapsed=true]:hidden">
                    {item.label}
                  </span>
                </a>
              )}
            </For>
          </div>
        )}
      </For>
    </nav>
  )

  const sidebarFooter = () => (
    <div class="w-full">
      <a href={nav().settings.href} class={navLinkClass(nav().settings.id)}>
        <RLIcon name={nav().settings.icon} class="size-5 shrink-0" />
        <span class="truncate flex-1 group-data-[collapsed=true]:hidden">
          {nav().settings.label}
        </span>
      </a>
    </div>
  )

  return (
    <RLDashboardGroup>
      <RLDashboardSidebar
        side="left"
        collapsible
        headerSlot={sidebarHeader()}
        footerSlot={sidebarFooter()}
      >
        {sidebarNav()}
      </RLDashboardSidebar>

      <RLDashboardPanel
        headerSlot={
          <RLDashboardNavbar title={props.title} icon="i-lucide-file-text" class="h-16 min-h-16">
            <div class="h-16 min-h-16 flex items-center gap-3">
              <RLDashboardSidebarToggle class="flex lg:hidden size-9 rounded-lg items-center justify-center border border-default hover:bg-muted text-toned hover:text-highlighted transition-colors shrink-0" />
              <RLDashboardSidebarCollapse side="left" class="hidden lg:flex size-9 rounded-lg" />
              <h1 class="text-lg sm:text-xl font-semibold text-highlighted truncate">
                {props.title}
              </h1>
            </div>
            <Show when={props.toolbarRight}>{props.toolbarRight}</Show>
          </RLDashboardNavbar>
        }
        bodySlot={
          <div class="flex flex-col gap-6">
            <Show
              when={props.toolbarLeft}
              fallback={<p class="text-sm text-muted">{description()}</p>}
            >
              <RLDashboardToolbar>{props.toolbarLeft}</RLDashboardToolbar>
            </Show>
            <div class="section-content flex flex-col gap-6">{props.children}</div>
          </div>
        }
      />
    </RLDashboardGroup>
  )
}

export default CMSDashboardLayout
