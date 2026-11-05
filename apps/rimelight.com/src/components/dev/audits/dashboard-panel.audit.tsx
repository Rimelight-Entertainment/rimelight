import { RLDashboardPanel } from "@rimelight/ui/components/dashboard-panel/RLDashboardPanel.tsx";
import type { ComponentAuditDefinition } from "./types";

export const DashboardPanelSandbox = () => (
  <RLDashboardPanel headerSlot={<span>Panel header</span>} footerSlot={<span>Panel footer</span>}>
    Panel body content
  </RLDashboardPanel>
);

export const dashboardPanelAudit: ComponentAuditDefinition = {
  id: "dashboard-panel",
  name: "Dashboard Panel",
  category: "Layout",
  status: "Auditing",
  description:
    "A dashboard panel with optional header and footer regions, a body, and an optional desktop resize handle.",
  importPath: "@rimelight/ui/components/dashboard-panel/RLDashboardPanel.tsx",
  renderSandbox: () => <DashboardPanelSandbox />,
  testScenarios: [
    {
      id: "default-children",
      title: "Default slot (children)",
      description: "Children render as the body.",
      render: () => <RLDashboardPanel>Panel body content</RLDashboardPanel>,
    },
    {
      id: "header-slot",
      title: "Header slot",
      description: "Content above the body.",
      render: () => (
        <RLDashboardPanel headerSlot={<span>Panel header</span>}>Body</RLDashboardPanel>
      ),
    },
    {
      id: "body-slot",
      title: "Body slot",
      description: "Replaces children as the body.",
      render: () => (
        <RLDashboardPanel bodySlot={<span>Replacement body</span>}>Ignored</RLDashboardPanel>
      ),
    },
    {
      id: "footer-slot",
      title: "Footer slot",
      description: "Content below the body.",
      render: () => (
        <RLDashboardPanel footerSlot={<span>Panel footer</span>}>Body</RLDashboardPanel>
      ),
    },
    {
      id: "handle-slot",
      title: "Handle slot",
      description: "Replaces the default drag handle when resizable.",
      render: () => (
        <RLDashboardPanel resizable handleSlot={<span>Grip</span>}>
          Body
        </RLDashboardPanel>
      ),
    },
  ],
};
