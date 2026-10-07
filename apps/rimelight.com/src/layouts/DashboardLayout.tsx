import { type Component, For } from "solid-js";
import { useParams } from "@solidjs/router";
import type { JSX } from "@solidjs/web";
import AppLayout from "./AppLayout";
import {
  RLDashboardGroup,
  RLDashboardSidebar,
  RLDashboardPanel,
  RLDashboardNavbar,
  RLDashboardSidebarCollapse,
  RLDashboardSidebarToggle,
  RLButton,
} from "@rimelight/ui";
import { getRelativeLocaleUrl, setCurrentLocale } from "@rimelight/i18n";

export interface DashboardLayoutProps {
  title?: string | undefined;
  description?: string | undefined;
  favicon?: string | undefined;
  children?: JSX.Element | undefined;
  session?: any;
}

export const DashboardLayout: Component<DashboardLayoutProps> = (props) => {
  const params = useParams<{ locale?: string }>();
  if (params.locale && ["en", "pt", "es"].includes(params.locale)) {
    setCurrentLocale(params.locale);
  }

  const links = [
    { label: "Home", icon: "i-lucide-home", to: "/dashboard" },
    { label: "Inbox", icon: "i-lucide-inbox", to: "/dashboard/inbox" },
    { label: "Notes", icon: "i-lucide-notebook", to: "/dashboard/notes" },
    { label: "Projects", icon: "i-lucide-square-kanban", to: "/dashboard/projects" },
  ];

  const footerLinks = [{ label: "CMS Content", icon: "i-lucide-file-text", to: "/cms" }];

  return (
    <AppLayout
      title={props.title || "Dashboard"}
      description={props.description || "Rimelight Dashboard"}
      noindex={true}
      favicon={props.favicon}
      session={props.session}
    >
      <RLDashboardGroup style={{ "padding-top": "var(--rl-total-header-height, 0px)" }}>
        <RLDashboardSidebar
          side="left"
          collapsible
          class="h-full border-r border-neutral-200/50 bg-neutral-50"
          header={
            <div class="flex flex-col gap-2 w-full p-4">
              <div class="flex items-center gap-3 p-2">
                <span class="i-lucide-layout-dashboard size-5 shrink-0 text-neutral-600" />
                <span class="text-sm font-semibold text-neutral-900 truncate">Dashboard</span>
              </div>
              <RLDashboardSidebarCollapse side="left" class="shrink-0" />
            </div>
          }
          footer={
            <div class="p-4 border-t border-neutral-200/50 flex flex-col gap-2 shrink-0">
              <nav class="flex flex-col gap-1">
                <For each={footerLinks}>
                  {(item) => (
                    <a
                      href={getRelativeLocaleUrl(item.to)}
                      class="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-neutral-600 hover:bg-neutral-100"
                    >
                      <span class={`${item.icon} size-5 shrink-0`} />
                      <span class="truncate">{item.label}</span>
                    </a>
                  )}
                </For>
              </nav>
              <div class="h-[1px] bg-neutral-200 my-2" />
              <div class="flex flex-row gap-2 justify-between items-center">
                <a href={getRelativeLocaleUrl("/dashboard/settings")}>
                  <RLButton
                    color="neutral"
                    variant="soft"
                    class="rounded-xl size-8 p-0"
                    title="Settings"
                  >
                    <span class="i-lucide-cog size-4" />
                  </RLButton>
                </a>
                <a href={getRelativeLocaleUrl("/dashboard/help")}>
                  <RLButton
                    color="neutral"
                    variant="soft"
                    class="rounded-xl size-8 p-0"
                    title="Help"
                  >
                    <span class="i-lucide-circle-help size-4" />
                  </RLButton>
                </a>
                <a href={getRelativeLocaleUrl("/dashboard/report-issue")}>
                  <RLButton
                    color="neutral"
                    variant="soft"
                    class="rounded-xl size-8 p-0"
                    title="Report Issue"
                  >
                    <span class="i-lucide-bug size-4" />
                  </RLButton>
                </a>
              </div>
            </div>
          }
        >
          <nav class="flex flex-col gap-1">
            <For each={links}>
              {(item) => (
                <a
                  href={getRelativeLocaleUrl(item.to)}
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-neutral-600 hover:bg-neutral-100"
                >
                  <span class={`${item.icon} size-5 shrink-0`} />
                  <span class="truncate">{item.label}</span>
                </a>
              )}
            </For>
          </nav>
        </RLDashboardSidebar>

        <RLDashboardPanel
          header={
            <RLDashboardNavbar
              left={
                <>
                  <RLDashboardSidebarToggle side="left" class="lg:hidden" />
                  <h1 class="text-lg font-semibold text-neutral-900">
                    {props.title || "Dashboard"}
                  </h1>
                </>
              }
            />
          }
        >
          <div data-slot="body" class="flex-1 flex flex-col min-w-0 overflow-y-auto p-6">
            {props.children}
          </div>
        </RLDashboardPanel>
      </RLDashboardGroup>
    </AppLayout>
  );
};

export default DashboardLayout;
