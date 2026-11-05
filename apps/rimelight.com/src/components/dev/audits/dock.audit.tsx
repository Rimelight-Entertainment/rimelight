import type { JSX } from "@solidjs/web";
import { RLDock } from "@rimelight/ui/components/dock/RLDock.tsx";
import type { ComponentAuditDefinition } from "./types";

export const DockSandbox = (): JSX.Element => (
  <div class="flex w-full justify-center p-6">
    <RLDock class="flex items-center gap-2 rounded-xl border border-default bg-default p-2 shadow-md">
      <button type="button" class="rounded-md px-3 py-1 text-sm hover:bg-muted">
        Home
      </button>
      <button type="button" class="rounded-md px-3 py-1 text-sm hover:bg-muted">
        Search
      </button>
      <button type="button" class="rounded-md px-3 py-1 text-sm hover:bg-muted">
        Settings
      </button>
    </RLDock>
  </div>
);

export const dockAudit: ComponentAuditDefinition = {
  id: "dock",
  name: "Dock",
  category: "Navigation",
  status: "Planned",
  description:
    "Dock container for pinned actions. The type JSDoc marks it as a stub: it renders a root element and its children only.",
  importPath: "@rimelight/ui/components/dock/RLDock.tsx",
  renderSandbox: () => <DockSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot children",
      description:
        "The only slot is the default children slot. Passes plain action buttons as children.",
      render: () => (
        <RLDock class="flex items-center gap-2 rounded-xl border border-default bg-default p-2">
          <button type="button" class="rounded-md px-3 py-1 text-sm">
            Home
          </button>
          <button type="button" class="rounded-md px-3 py-1 text-sm">
            Search
          </button>
        </RLDock>
      ),
    },
    {
      id: "as-prop",
      title: "Rendered as a different element",
      description:
        'The root is typed with a default of div. Passes as="nav" to confirm the Tag swap works.',
      render: () => (
        <RLDock as="nav" aria-label="Pinned actions" class="flex items-center gap-2">
          <button type="button" class="rounded-md px-3 py-1 text-sm">
            Pinned
          </button>
        </RLDock>
      ),
    },
  ],
};
