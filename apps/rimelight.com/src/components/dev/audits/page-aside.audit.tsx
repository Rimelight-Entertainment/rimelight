import type { JSX } from "@solidjs/web";
import { RLPageAside } from "@rimelight/ui/components/page-aside/RLPageAside.tsx";
import type { ComponentAuditDefinition } from "./types";

export const PageAsideSandbox = (): JSX.Element => {
  return (
    <div class="flex flex-col gap-6">
      <div class="p-8 rounded-xl border border-default bg-elevated/10">
        <RLPageAside>
          <p>Page aside content preview.</p>
        </RLPageAside>
      </div>
    </div>
  );
};

export const pageAsideAudit: ComponentAuditDefinition = {
  id: "page-aside",
  name: "PageAside",
  category: "Layout",
  status: "Auditing",
  description: "Page aside region rendered inside the themed root.",
  importPath: "@rimelight/ui/components/page-aside/RLPageAside.tsx",
  renderSandbox: () => <PageAsideSandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Root children",
      description: "Passes text and a nested element as children to the root.",
      render: () => (
        <RLPageAside>
          Aside text <strong>with nested element</strong>
        </RLPageAside>
      ),
    },
    {
      id: "as-polymorphic",
      title: "as polymorphic",
      description: "Renders the root as an aside element via the as prop.",
      render: () => (
        <RLPageAside as="aside">
          <p>Rendered as an aside.</p>
        </RLPageAside>
      ),
    },
    {
      id: "class-passthrough",
      title: "class passthrough",
      description: "Passes a class string that is applied to the root.",
      render: () => (
        <RLPageAside class="p-4 border border-default">
          <p>Custom class applied to root.</p>
        </RLPageAside>
      ),
    },
    {
      id: "ui-root-override",
      title: "ui root override",
      description: "Overrides the root slot classes via the ui prop.",
      render: () => (
        <RLPageAside ui={{ root: "p-4 bg-elevated" }}>
          <p>Root classes overridden via ui.</p>
        </RLPageAside>
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
