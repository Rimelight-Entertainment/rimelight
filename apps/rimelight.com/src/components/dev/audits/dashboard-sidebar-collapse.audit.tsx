import type { JSX } from "@solidjs/web";
import { RLDashboardSidebarCollapse } from "@rimelight/ui/components/dashboard-sidebar-collapse/RLDashboardSidebarCollapse.tsx";
import type { ComponentAuditDefinition } from "./types";

export const DashboardSidebarCollapseSandbox = (): JSX.Element => <RLDashboardSidebarCollapse />;

export const dashboardSidebarCollapseAudit: ComponentAuditDefinition = {
  id: "dashboard-sidebar-collapse",
  name: "Dashboard Sidebar Collapse",
  category: "Navigation",
  status: "Auditing",
  description:
    "Desktop-only button that collapses the dashboard sidebar to icon width. It shows the panel-left icon by default and accepts a custom icon name. Its label is localized.",
  importPath: "@rimelight/ui/components/dashboard-sidebar-collapse/RLDashboardSidebarCollapse.tsx",
  renderSandbox: () => <DashboardSidebarCollapseSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render after the icons inside the button.",
      render: () => (
        <RLDashboardSidebarCollapse>
          <span class="sr-only">Collapse sidebar</span>
        </RLDashboardSidebarCollapse>
      ),
    },
    {
      id: "default-icon",
      title: "Default icon",
      description: "Default panel-left icon.",
      render: () => <RLDashboardSidebarCollapse />,
    },
    {
      id: "custom-icon",
      title: "Custom icon",
      description: "Icon prop replaces the default expanded icon.",
      render: () => <RLDashboardSidebarCollapse icon="i-lucide-panel-left-close" />,
    },
  ],
};
