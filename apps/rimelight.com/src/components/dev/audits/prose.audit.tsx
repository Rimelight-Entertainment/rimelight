import type { JSX } from "@solidjs/web";
import { RLProse } from "@rimelight/ui/components/prose/RLProse.tsx";
import type { ComponentAuditDefinition } from "./types";

export const ProseSandbox = (): JSX.Element => (
  <div class="p-8 rounded-xl border border-default bg-elevated/10">
    <RLProse>
      <span>Typography container preview.</span>
    </RLProse>
  </div>
);

export const proseAudit: ComponentAuditDefinition = {
  id: "prose",
  name: "Prose",
  category: "Data Display",
  status: "Auditing",
  description: "Typography container that renders children inside the themed root.",
  importPath: "@rimelight/ui/components/prose/RLProse.tsx",
  renderSandbox: () => <ProseSandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Children in root",
      description: "Real children (text plus a nested element) passed to the root container.",
      render: () => (
        <RLProse>
          <span>Body copy inside the prose root.</span>
          <span class="font-semibold">Emphasised nested element.</span>
        </RLProse>
      ),
    },
    {
      id: "as-polymorphic",
      title: "Polymorphic as",
      description: "Root rendered as a section element via the as prop.",
      render: () => (
        <RLProse as="section">
          <span>Rendered as section</span>
        </RLProse>
      ),
    },
    {
      id: "class-passthrough",
      title: "Class passthrough",
      description: "Additional class string merged onto the root element.",
      render: () => (
        <RLProse class="p-4 rounded-xl border border-default">
          <span>Custom class applied</span>
        </RLProse>
      ),
    },
    {
      id: "ui-root-override",
      title: "UI root override",
      description: "ui.root slot class applied to the root element.",
      render: () => (
        <RLProse ui={{ root: "p-6" }}>
          <span>Root ui override applied</span>
        </RLProse>
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
      notes: "No style attributes in the RL file; styling resides in prose.theme.ts.",
    },
    {
      criterion: "No hydration-unsafe globals",
      status: "pass",
      notes: "Component body reads only props and theme setup output.",
    },
  ],
};
