import type { JSX } from "@solidjs/web";
import { RLPricingPlan } from "@rimelight/ui/components/pricing-plan/RLPricingPlan.tsx";
import type { ComponentAuditDefinition } from "./types";

export const PricingPlanSandbox = (): JSX.Element => (
  <div class="p-8 rounded-xl border border-default bg-elevated/10">
    <RLPricingPlan>
      <span>Single pricing plan preview.</span>
    </RLPricingPlan>
  </div>
);

export const pricingPlanAudit: ComponentAuditDefinition = {
  id: "pricing-plan",
  name: "PricingPlan",
  category: "Data Display",
  status: "Auditing",
  description: "Container for a single pricing plan.",
  importPath: "@rimelight/ui/components/pricing-plan/RLPricingPlan.tsx",
  renderSandbox: () => <PricingPlanSandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Children in root",
      description: "Real children (text plus a nested element) passed to the root container.",
      render: () => (
        <RLPricingPlan>
          <span>Pro plan</span>
          <span class="font-semibold">$12 per month</span>
        </RLPricingPlan>
      ),
    },
    {
      id: "as-polymorphic",
      title: "Polymorphic as",
      description: "Root rendered as a section element via the as prop.",
      render: () => (
        <RLPricingPlan as="section">
          <span>Rendered as section</span>
        </RLPricingPlan>
      ),
    },
    {
      id: "class-passthrough",
      title: "Class passthrough",
      description: "Additional class string merged onto the root element.",
      render: () => (
        <RLPricingPlan class="p-4 rounded-xl border border-default">
          <span>Custom class applied</span>
        </RLPricingPlan>
      ),
    },
    {
      id: "ui-root-override",
      title: "UI root override",
      description: "ui.root slot class applied to the root element.",
      render: () => (
        <RLPricingPlan ui={{ root: "p-6" }}>
          <span>Root ui override applied</span>
        </RLPricingPlan>
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
      notes: "No style attributes in the RL file; styling resides in pricing-plan.theme.ts.",
    },
    {
      criterion: "No hydration-unsafe globals",
      status: "pass",
      notes: "Component body reads only props and theme setup output.",
    },
  ],
};
