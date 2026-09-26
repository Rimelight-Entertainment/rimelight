import { type Component, type JSX, For } from "solid-js"
import DashboardLayout from "./DashboardLayout"
import {
  RLDashboardGroup,
  RLDashboardSidebar,
  RLDashboardNavbar,
  RLDashboardPanel,
  RLDashboardToolbar,
  RLDashboardSidebarCollapse,
  RLDashboardSidebarToggle,
  RLIcon
} from "@rimelight/ui"

const navItems = [
  { icon: "layoutDashboard", label: "Overview", href: "/admin", id: "overview" },
  { icon: "folder", label: "Categories", href: "/admin/categories", id: "categories" },
  { icon: "tag", label: "Tags", href: "/admin/tags", id: "tags" },
  { icon: "penTool", label: "Bylines", href: "/admin/bylines", id: "bylines" },
  { icon: "network", label: "Taxonomies", href: "/admin/taxonomies", id: "taxonomies" },
  { icon: "fileText", label: "CMS Content", href: "/cms", id: "cms" }
]

export interface AuthAdminDashboardLayoutProps {
  title: string
  description: string
  activeSection?: string
  activeNav?: string
  actions?: JSX.Element
  children?: JSX.Element
  session?: any
}

export const AuthAdminDashboardLayout: Component<AuthAdminDashboardLayoutProps> = (props) => {
  const currentActive = () => props.activeNav || props.activeSection || "overview"

  return (
    <DashboardLayout title={props.title} description={props.description} session={props.session}>
      <RLDashboardGroup>
        <RLDashboardSidebar
          side="left"
          collapsible={true}
          header={
            <>
              <div class="flex items-center gap-2.5">
                <div class="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  <RLIcon
                    name="shield"
                    class="size-5 text-primary group-data-[collapsed=true]:hidden"
                  />
                </div>
                <div class="flex flex-col truncate group-data-[collapsed=true]:hidden">
                  <span class="font-semibold text-highlighted text-sm leading-none">
                    Identity Admin
                  </span>
                  <span class="text-xs text-muted mt-0.5">Cloudflare Access</span>
                </div>
              </div>
              <RLDashboardSidebarCollapse
                side="left"
                class="shrink-0 ml-auto group-data-[collapsed=true]:mx-auto"
              />
            </>
          }
        >
          <nav class="flex flex-col gap-1 mt-2">
            <For each={navItems}>
              {(item) => (
                <a
                  href={item.href}
                  class={
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-0 " +
                    (item.id === currentActive()
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted hover:text-highlighted hover:bg-muted/50")
                  }
                >
                  <RLIcon name={item.icon} class="size-5 shrink-0" />
                  <span class="truncate flex-1 group-data-[collapsed=true]:hidden">
                    {item.label}
                  </span>
                </a>
              )}
            </For>
          </nav>
        </RLDashboardSidebar>

        <RLDashboardPanel
          header={
            <RLDashboardNavbar
              title={props.title}
              left={
                <div class="flex items-center gap-3">
                  <RLDashboardSidebarToggle class="flex lg:hidden size-9 rounded-lg items-center justify-center border border-default hover:bg-muted text-toned hover:text-highlighted transition-colors shrink-0" />
                  <RLDashboardSidebarCollapse
                    side="left"
                    class="hidden lg:flex size-9 rounded-lg"
                  />
                  <h1 class="text-xl font-semibold text-highlighted truncate">{props.title}</h1>
                </div>
              }
            />
          }
          body={
            <div class="flex flex-col gap-4 flex-1">
              <RLDashboardToolbar
                left={<p class="text-sm text-muted">{props.description}</p>}
                right={<div class="flex items-center gap-2">{props.actions}</div>}
              />
              <div class="flex-1 overflow-y-auto min-h-0 p-6">{props.children}</div>
            </div>
          }
        />
      </RLDashboardGroup>
    </DashboardLayout>
  )
}

export default AuthAdminDashboardLayout
