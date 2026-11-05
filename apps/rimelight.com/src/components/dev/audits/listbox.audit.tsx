import type { JSX } from "@solidjs/web";
import { RLListbox } from "@rimelight/ui/components/listbox/RLListbox.tsx";
import type { ComponentAuditDefinition } from "./types";

export const ListboxSandbox = (): JSX.Element => {
  return (
    <div class="flex flex-col gap-6">
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        <RLListbox>
          <span>
            Listbox text child <strong>nested element</strong>
          </span>
        </RLListbox>
      </div>
    </div>
  );
};

export const listboxAudit: ComponentAuditDefinition = {
  id: "listbox",
  name: "Listbox",
  category: "Form & Input",
  status: "Auditing",
  description: "Listbox container for selectable options.",
  importPath: "@rimelight/ui/components/listbox/RLListbox.tsx",
  renderSandbox: () => <ListboxSandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Children on root",
      description: "Text and a nested element passed as children render inside the root.",
      render: () => (
        <RLListbox>
          <span>
            Listbox text child <strong>nested element</strong>
          </span>
        </RLListbox>
      ),
    },
    {
      id: "as-polymorphic",
      title: "as polymorphic root",
      description: "The as prop changes the rendered root element tag.",
      render: () => (
        <RLListbox as="section">
          <span>
            Rendered as section <strong>nested element</strong>
          </span>
        </RLListbox>
      ),
    },
    {
      id: "class-passthrough",
      title: "class passthrough",
      description: "A class prop is applied to the root alongside themed classes.",
      render: () => (
        <RLListbox class="border-2 border-primary">
          <span>
            Custom class root <strong>nested element</strong>
          </span>
        </RLListbox>
      ),
    },
    {
      id: "ui-root-override",
      title: "ui root override",
      description: "The ui.root prop overrides the root slot classes.",
      render: () => (
        <RLListbox ui={{ root: "outline-2 outline-primary" }}>
          <span>
            ui.root override <strong>nested element</strong>
          </span>
        </RLListbox>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Functional implementation",
      status: "warn",
      notes: "Barebones root-only container; functional build-out pending",
    },
    {
      criterion: "as polymorphism",
      status: "pass",
      notes: "Root tag resolved from props.as via theme setup, default div.",
    },
    {
      criterion: "class / ui passthrough",
      status: "pass",
      notes: "class and ui.root are merged into the root classes.",
    },
    {
      criterion: "data-slot / data-theme",
      status: "pass",
      notes: 'Root renders data-slot="root" and data-theme.',
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pending",
      notes: "Requires verification of listbox.theme.ts output.",
    },
    {
      criterion: "No hydration-unsafe globals",
      status: "pending",
      notes: "Requires verification of module-level side effects.",
    },
  ],
};
