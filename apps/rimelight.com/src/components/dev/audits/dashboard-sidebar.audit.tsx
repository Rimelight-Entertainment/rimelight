import { RLDashboardSidebar } from "@rimelight/ui/components/dashboard-sidebar/RLDashboardSidebar.tsx";
import type { ComponentAuditDefinition } from "./types";

export const DashboardSidebarSandbox = () => (
  <RLDashboardSidebar
    headerSlot={<span>Workspace</span>}
    footerSlot={<span>Account</span>}
    collapsible
  >
    Navigation links
  </RLDashboardSidebar>
);

export const dashboardSidebarAudit: ComponentAuditDefinition = {
  id: "dashboard-sidebar",
  name: "Dashboard Sidebar",
  category: "Navigation",
  status: "Auditing",
  description:
    "A dashboard sidebar attached to the left or right edge, with optional header and footer, desktop collapse to icon width, and a mobile drawer.",
  importPath: "@rimelight/ui/components/dashboard-sidebar/RLDashboardSidebar.tsx",
  renderSandbox: () => <DashboardSidebarSandbox />,
  testScenarios: [
    {
      id: "default-children",
      title: "Default slot (children)",
      description: "Children render as the sidebar body.",
      render: () => <RLDashboardSidebar>Navigation links</RLDashboardSidebar>,
    },
    {
      id: "header-slot",
      title: "Header slot",
      description: "Content above the body.",
      render: () => (
        <RLDashboardSidebar headerSlot={<span>Workspace</span>}>Links</RLDashboardSidebar>
      ),
    },
    {
      id: "footer-slot",
      title: "Footer slot",
      description: "Content below the body.",
      render: () => (
        <RLDashboardSidebar footerSlot={<span>Account</span>}>Links</RLDashboardSidebar>
      ),
    },
    {
      id: "right-side",
      title: "Right side",
      description: "Sidebar attached to the right edge.",
      render: () => <RLDashboardSidebar side="right">Links</RLDashboardSidebar>,
    },
  ],
};
