import type { JSX } from "@solidjs/web";
import { RLPageHeader } from "@rimelight/ui/components/page-header/RLPageHeader.tsx";
import type { ComponentAuditDefinition } from "./types";

export const PageHeaderSandbox = (): JSX.Element => (
  <div class="p-8 rounded-xl border border-default bg-elevated/10">
    <RLPageHeader>
      <span>Page header preview.</span>
    </RLPageHeader>
  </div>
);

export const pageHeaderAudit: ComponentAuditDefinition = {
  id: "page-header",
  name: "PageHeader",
  category: "Layout",
  status: "Auditing",
  description: "Page header region rendered inside the themed root.",
  importPath: "@rimelight/ui/components/page-header/RLPageHeader.tsx",
  renderSandbox: () => <PageHeaderSandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Children in root",
      description: "Real children (text plus a nested element) passed to the root container.",
      render: () => (
        <RLPageHeader>
          <span>Dashboard</span>
          <span class="font-semibold">Overview of recent activity</span>
        </RLPageHeader>
      ),
    },
    {
      id: "as-polymorphic",
      title: "Polymorphic as",
      description: "Root rendered as a section element via the as prop.",
      render: () => (
        <RLPageHeader as="section">
          <span>Rendered as section</span>
        </RLPageHeader>
      ),
    },
    {
      id: "class-passthrough",
      title: "Class passthrough",
      description: "Additional class string merged onto the root element.",
      render: () => (
        <RLPageHeader class="p-4 rounded-xl border border-default">
          <span>Custom class applied</span>
        </RLPageHeader>
      ),
    },
    {
      id: "ui-root-override",
      title: "UI root override",
      description: "ui.root slot class applied to the root element.",
      render: () => (
        <RLPageHeader ui={{ root: "p-6" }}>
          <span>Root ui override applied</span>
        </RLPageHeader>
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
      notes: "Root element is polymorphic via the as prop (default div).",
    },
    {
      criterion: "class / ui passthrough",
      status: "pass",
      notes: "class and ui.root are applied to the root element via the theme setup.",
    },
    {
      criterion: "data-slot / data-theme",
      status: "pass",
      notes: 'Root carries data-slot="root" and data-theme.',
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes: "No style attributes in the RL file; styling resides in page-header.theme.ts.",
    },
    {
      criterion: "No hydration-unsafe globals",
      status: "pass",
      notes: "Component body reads only props and theme setup output.",
    },
  ],
};
