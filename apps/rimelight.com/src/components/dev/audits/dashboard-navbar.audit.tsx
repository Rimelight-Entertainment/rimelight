import { RLDashboardNavbar } from "@rimelight/ui/components/dashboard-navbar/RLDashboardNavbar.tsx";
import type { ComponentAuditDefinition } from "./types";

export const DashboardNavbarSandbox = () => (
  <RLDashboardNavbar icon="house" title="Overview" trailingSlot={<span>Avatar</span>}>
    Search
  </RLDashboardNavbar>
);

export const dashboardNavbarAudit: ComponentAuditDefinition = {
  id: "dashboard-navbar",
  name: "Dashboard Navbar",
  category: "Navigation",
  status: "Auditing",
  description:
    "A dashboard top bar with a mobile sidebar toggle, an icon and title, a center region, and a trailing region.",
  importPath: "@rimelight/ui/components/dashboard-navbar/RLDashboardNavbar.tsx",
  renderSandbox: () => <DashboardNavbarSandbox />,
  testScenarios: [
    {
      id: "default-children",
      title: "Default slot (children)",
      description: "Children render in the center region when centerSlot is omitted.",
      render: () => <RLDashboardNavbar title="Overview">Search</RLDashboardNavbar>,
    },
    {
      id: "leading-slot",
      title: "Leading slot",
      description: "Replaces the whole leading region (icon, title, and toggle).",
      render: () => <RLDashboardNavbar leadingSlot={<span>Custom leading</span>} />,
    },
    {
      id: "icon-slot",
      title: "Icon slot",
      description: "Replaces the default icon.",
      render: () => <RLDashboardNavbar title="Overview" iconSlot={<span>IC</span>} />,
    },
    {
      id: "title-slot",
      title: "Title slot",
      description: "Replaces the default title text.",
      render: () => <RLDashboardNavbar titleSlot={<span>Custom title</span>} />,
    },
    {
      id: "center-slot",
      title: "Center slot",
      description: "Replaces children in the center region.",
      render: () => (
        <RLDashboardNavbar title="Overview" centerSlot={<span>Center content</span>}>
          Ignored
        </RLDashboardNavbar>
      ),
    },
    {
      id: "trailing-slot",
      title: "Trailing slot",
      description: "Content at the trailing edge.",
      render: () => <RLDashboardNavbar title="Overview" trailingSlot={<span>Avatar</span>} />,
    },
  ],
};
