import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLDashboardSearch } from "@rimelight/ui/components/dashboard-search/RLDashboardSearch.tsx";
import type { ComponentAuditDefinition } from "./types";

export const DashboardSearchSandbox = (): JSX.Element => (
  <div class="flex flex-col gap-4 text-sm text-muted">
    <p>Press Ctrl/Cmd+K or click a search button to open the dialog. Escape closes it.</p>
    <RLDashboardSearch>
      <span class="text-xs">Search trigger area</span>
    </RLDashboardSearch>
  </div>
);

export const dashboardSearchAudit: ComponentAuditDefinition = {
  id: "dashboard-search",
  name: "Dashboard Search",
  category: "Navigation",
  status: "Auditing",
  description:
    "A search dialog for dashboards opened with Ctrl/Cmd+K or a dashboard search button, closed with Escape or a backdrop click. Supports controlled and uncontrolled open state. It renders its children in the default slot.",
  importPath: "@rimelight/ui/components/dashboard-search/RLDashboardSearch.tsx",
  renderSandbox: () => <DashboardSearchSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render in the closed state. The dialog is not shown.",
      render: () => (
        <RLDashboardSearch>
          <span class="text-xs text-muted">Closed search host</span>
        </RLDashboardSearch>
      ),
    },
    {
      id: "default-open",
      title: "Default open",
      description: "Uncontrolled dialog that starts open.",
      render: () => (
        <RLDashboardSearch defaultOpen>
          <span class="text-xs text-muted">Host content</span>
        </RLDashboardSearch>
      ),
    },
    {
      id: "controlled-open",
      title: "Controlled open",
      description: "Open state controlled through open and onOpenChange.",
      render: () => {
        const [open, setOpen] = createSignal(false);
        return (
          <div class="flex flex-col gap-2">
            <button
              type="button"
              class="self-start px-2 py-0.5 rounded text-xs bg-elevated border border-default text-muted"
              onClick={() => setOpen((o) => !o)}
            >
              {open() ? "Close from outside" : "Open from outside"}
            </button>
            <RLDashboardSearch open={open()} onOpenChange={setOpen}>
              <span class="text-xs text-muted">Controlled host</span>
            </RLDashboardSearch>
          </div>
        );
      },
    },
  ],
};
