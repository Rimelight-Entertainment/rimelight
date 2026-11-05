import type { JSX } from "@solidjs/web";
import { RLFloatingAction } from "@rimelight/ui/components/floating-action/RLFloatingAction.tsx";
import type { ComponentAuditDefinition } from "./types";

export const FloatingActionSandbox = (): JSX.Element => {
  return (
    <div class="flex flex-col gap-6">
      <div class="p-8 rounded-xl border border-default bg-elevated/10">
        <RLFloatingAction>
          <p>Floating action content preview.</p>
        </RLFloatingAction>
      </div>
    </div>
  );
};

export const floatingActionAudit: ComponentAuditDefinition = {
  id: "floating-action",
  name: "FloatingAction",
  category: "Navigation",
  status: "Auditing",
  description: "Floating action container anchored to a corner of its parent.",
  importPath: "@rimelight/ui/components/floating-action/RLFloatingAction.tsx",
  renderSandbox: () => <FloatingActionSandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Root children",
      description: "Passes text and a nested element as children to the root.",
      render: () => (
        <RLFloatingAction>
          Action text <strong>with nested element</strong>
        </RLFloatingAction>
      ),
    },
    {
      id: "as-polymorphic",
      title: "as polymorphic",
      description: "Renders the root as a section element via the as prop.",
      render: () => (
        <RLFloatingAction as="section">
          <p>Rendered as a section.</p>
        </RLFloatingAction>
      ),
    },
    {
      id: "class-passthrough",
      title: "class passthrough",
      description: "Passes a class string that is applied to the root.",
      render: () => (
        <RLFloatingAction class="p-4 border border-default">
          <p>Custom class applied to root.</p>
        </RLFloatingAction>
      ),
    },
    {
      id: "ui-root-override",
      title: "ui root override",
      description: "Overrides the root slot classes via the ui prop.",
      render: () => (
        <RLFloatingAction ui={{ root: "p-4 bg-elevated" }}>
          <p>Root classes overridden via ui.</p>
        </RLFloatingAction>
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
      notes: "Root element resolved from Tag in the theme setup.",
    },
    {
      criterion: "class / ui passthrough",
      status: "pending",
      notes: "Class and ui root merging is handled in the theme setup; not yet verified in audit.",
    },
    {
      criterion: "data-slot / data-theme",
      status: "pass",
      notes: 'Root sets data-slot="root" and data-theme.',
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes: "No inline style attributes in the component.",
    },
    {
      criterion: "No hydration-unsafe globals",
      status: "pass",
      notes: "No window/document access at render.",
    },
    {
      criterion: "Audited components render bare (no harness wrappers)",
      status: "pass",
      notes: "All scenario renders return bare components directly.",
    },
  ],
};
