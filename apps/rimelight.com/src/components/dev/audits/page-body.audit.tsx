import type { JSX } from "@solidjs/web";
import { RLPageBody } from "@rimelight/ui/components/page-body/RLPageBody.tsx";
import type { ComponentAuditDefinition } from "./types";

export const PageBodySandbox = (): JSX.Element => {
  return (
    <div class="flex flex-col gap-6">
      <div class="p-8 rounded-xl border border-default bg-elevated/10">
        <RLPageBody>
          <p>Page body content preview.</p>
        </RLPageBody>
      </div>
    </div>
  );
};

export const pageBodyAudit: ComponentAuditDefinition = {
  id: "page-body",
  name: "PageBody",
  category: "Layout",
  status: "Auditing",
  description: "Page body region rendered inside the themed root.",
  importPath: "@rimelight/ui/components/page-body/RLPageBody.tsx",
  renderSandbox: () => <PageBodySandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Root children",
      description: "Passes text and a nested element as children to the root.",
      render: () => (
        <RLPageBody>
          Body text <strong>with nested element</strong>
        </RLPageBody>
      ),
    },
    {
      id: "as-polymorphic",
      title: "as polymorphic",
      description: "Renders the root as a section element via the as prop.",
      render: () => (
        <RLPageBody as="section">
          <p>Rendered as a section.</p>
        </RLPageBody>
      ),
    },
    {
      id: "class-passthrough",
      title: "class passthrough",
      description: "Passes a class string that is applied to the root.",
      render: () => (
        <RLPageBody class="p-4 border border-default">
          <p>Custom class applied to root.</p>
        </RLPageBody>
      ),
    },
    {
      id: "ui-root-override",
      title: "ui root override",
      description: "Overrides the root slot classes via the ui prop.",
      render: () => (
        <RLPageBody ui={{ root: "p-4 bg-elevated" }}>
          <p>Root classes overridden via ui.</p>
        </RLPageBody>
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
