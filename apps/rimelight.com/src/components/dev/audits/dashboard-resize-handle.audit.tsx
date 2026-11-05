import type { JSX } from "@solidjs/web";
import { RLDashboardResizeHandle } from "@rimelight/ui/components/dashboard-resize-handle/RLDashboardResizeHandle.tsx";
import type { ComponentAuditDefinition } from "./types";

export const DashboardResizeHandleSandbox = (): JSX.Element => (
  <div class="flex h-32 items-stretch border border-default rounded-xl overflow-hidden">
    <div class="flex-1 bg-elevated/20 p-2 text-xs text-muted">Left panel</div>
    <RLDashboardResizeHandle aria-label="Resize panels" aria-orientation="vertical" />
    <div class="flex-1 bg-elevated/20 p-2 text-xs text-muted">Right panel</div>
  </div>
);

export const dashboardResizeHandleAudit: ComponentAuditDefinition = {
  id: "dashboard-resize-handle",
  name: "Dashboard Resize Handle",
  category: "Layout",
  status: "Auditing",
  description:
    "Drag handle between two dashboard panels, rendered with role separator. It is hidden below the lg breakpoint and has no variants. It renders its children in the default slot.",
  importPath: "@rimelight/ui/components/dashboard-resize-handle/RLDashboardResizeHandle.tsx",
  renderSandbox: () => <DashboardResizeHandleSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render inside the handle element.",
      render: () => (
        <RLDashboardResizeHandle aria-label="Resize with children">
          <span class="sr-only">Drag to resize</span>
        </RLDashboardResizeHandle>
      ),
    },
    {
      id: "between-panels",
      title: "Between panels",
      description: "Handle placed between two panels, as in a dashboard layout.",
      render: () => (
        <div class="flex h-32 items-stretch border border-default rounded-xl overflow-hidden">
          <div class="flex-1 bg-elevated/20 p-2 text-xs text-muted">Panel A</div>
          <RLDashboardResizeHandle aria-label="Resize panels" />
          <div class="flex-1 bg-elevated/20 p-2 text-xs text-muted">Panel B</div>
        </div>
      ),
    },
  ],
};
