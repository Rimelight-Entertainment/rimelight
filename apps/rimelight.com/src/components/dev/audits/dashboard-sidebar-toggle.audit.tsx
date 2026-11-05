import type { JSX } from "@solidjs/web";
import { RLDashboardSidebarToggle } from "@rimelight/ui/components/dashboard-sidebar-toggle/RLDashboardSidebarToggle.tsx";
import type { ComponentAuditDefinition } from "./types";

export const DashboardSidebarToggleSandbox = (): JSX.Element => <RLDashboardSidebarToggle />;

export const dashboardSidebarToggleAudit: ComponentAuditDefinition = {
  id: "dashboard-sidebar-toggle",
  name: "Dashboard Sidebar Toggle",
  category: "Navigation",
  status: "Auditing",
  description:
    "Mobile-only button that opens the dashboard sidebar drawer. It shows a menu icon by default, accepts a custom icon name, and its label is localized.",
  importPath: "@rimelight/ui/components/dashboard-sidebar-toggle/RLDashboardSidebarToggle.tsx",
  renderSandbox: () => <DashboardSidebarToggleSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render after the icon inside the button.",
      render: () => (
        <RLDashboardSidebarToggle>
          <span class="sr-only">Open sidebar</span>
        </RLDashboardSidebarToggle>
      ),
    },
    {
      id: "default-icon",
      title: "Default icon",
      description: "Default menu icon.",
      render: () => <RLDashboardSidebarToggle />,
    },
    {
      id: "custom-icon",
      title: "Custom icon",
      description: "Icon prop replaces the default menu icon.",
      render: () => <RLDashboardSidebarToggle icon="panel-left" />,
    },
  ],
};
