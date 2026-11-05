import type { JSX } from "@solidjs/web";
import { RLDashboardGroup } from "@rimelight/ui/components/dashboard-group/RLDashboardGroup.tsx";
import type { ComponentAuditDefinition } from "./types";

export const DashboardGroupSandbox = (): JSX.Element => (
  <div class="h-64 border border-default rounded-xl">
    <RLDashboardGroup>
      <div class="w-48 bg-elevated/40 p-2 text-xs text-muted">Sidebar</div>
      <div class="flex-1 bg-elevated/20 p-2 text-xs text-muted">Panel</div>
    </RLDashboardGroup>
  </div>
);

export const dashboardGroupAudit: ComponentAuditDefinition = {
  id: "dashboard-group",
  name: "Dashboard Group",
  category: "Layout",
  status: "Auditing",
  description:
    "A horizontal row that lays out a dashboard sidebar and its panels. It has no variants and renders its children in the default slot.",
  importPath: "@rimelight/ui/components/dashboard-group/RLDashboardGroup.tsx",
  renderSandbox: () => <DashboardGroupSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children lay out in a row.",
      render: () => (
        <div class="h-48 border border-default rounded-xl">
          <RLDashboardGroup>
            <div class="w-40 bg-elevated/40 p-2 text-xs text-muted">Sidebar</div>
            <div class="flex-1 bg-elevated/20 p-2 text-xs text-muted">Panel</div>
          </RLDashboardGroup>
        </div>
      ),
    },
    {
      id: "three-columns",
      title: "Three columns",
      description: "Sidebar, main panel, and secondary panel side by side.",
      render: () => (
        <div class="h-48 border border-default rounded-xl">
          <RLDashboardGroup>
            <div class="w-40 bg-elevated/40 p-2 text-xs text-muted">Sidebar</div>
            <div class="flex-1 bg-elevated/20 p-2 text-xs text-muted">Main</div>
            <div class="w-56 bg-elevated/40 p-2 text-xs text-muted">Details</div>
          </RLDashboardGroup>
        </div>
      ),
    },
  ],
};
