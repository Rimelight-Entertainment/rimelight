import { RLDashboardToolbar } from "@rimelight/ui/components/dashboard-toolbar/RLDashboardToolbar.tsx";
import type { ComponentAuditDefinition } from "./types";

export const DashboardToolbarSandbox = () => (
  <RLDashboardToolbar leadingSlot={<span>Filters</span>} trailingSlot={<span>Export</span>} />
);

export const dashboardToolbarAudit: ComponentAuditDefinition = {
  id: "dashboard-toolbar",
  name: "Dashboard Toolbar",
  category: "Navigation",
  status: "Auditing",
  description:
    "A horizontal toolbar for dashboard content with a leading and a trailing region, or a single children region.",
  importPath: "@rimelight/ui/components/dashboard-toolbar/RLDashboardToolbar.tsx",
  renderSandbox: () => <DashboardToolbarSandbox />,
  testScenarios: [
    {
      id: "default-children",
      title: "Default slot (children)",
      description: "Children replace the leading and trailing regions.",
      render: () => (
        <RLDashboardToolbar>
          <span>Custom toolbar content</span>
        </RLDashboardToolbar>
      ),
    },
    {
      id: "leading-slot",
      title: "Leading slot",
      description: "Content at the start edge.",
      render: () => <RLDashboardToolbar leadingSlot={<span>Filters</span>} />,
    },
    {
      id: "trailing-slot",
      title: "Trailing slot",
      description: "Content at the end edge.",
      render: () => <RLDashboardToolbar trailingSlot={<span>Export</span>} />,
    },
  ],
};
