import { RLDashboardSearchButton } from "@rimelight/ui/components/dashboard-search-button/RLDashboardSearchButton.tsx";
import type { ComponentAuditDefinition } from "./types";

export const DashboardSearchButtonSandbox = () => <RLDashboardSearchButton />;

export const dashboardSearchButtonAudit: ComponentAuditDefinition = {
  id: "dashboard-search-button",
  name: "Dashboard Search Button",
  category: "Navigation",
  status: "Auditing",
  description:
    "A search trigger button for dashboards with an icon, a label, and keyboard shortcut hints that open the dashboard search.",
  importPath: "@rimelight/ui/components/dashboard-search-button/RLDashboardSearchButton.tsx",
  renderSandbox: () => <DashboardSearchButtonSandbox />,
  testScenarios: [
    {
      id: "default-children",
      title: "Default slot (label and shortcut hints)",
      description: "Default label and shortcut hints render without any slot.",
      render: () => <RLDashboardSearchButton />,
    },
    {
      id: "custom-label",
      title: "Label",
      description: "Visible label text set through the label prop.",
      render: () => <RLDashboardSearchButton label="Search projects" icon="folder" />,
    },
    {
      id: "trailing-slot",
      title: "Trailing slot",
      description: "Replaces the keyboard shortcut hints.",
      render: () => <RLDashboardSearchButton trailingSlot={<span>Beta</span>} label="Search" />,
    },
  ],
};
