import type { JSX } from "@solidjs/web";
import { RLPricingTable } from "@rimelight/ui/components/pricing-table/RLPricingTable.tsx";
import type { ComponentAuditDefinition } from "./types";

export const PricingTableSandbox = (): JSX.Element => (
  <div class="p-8 rounded-xl border border-default bg-elevated/10">
    <RLPricingTable>
      <span>Pricing plans container preview.</span>
    </RLPricingTable>
  </div>
);

export const pricingTableAudit: ComponentAuditDefinition = {
  id: "pricing-table",
  name: "PricingTable",
  category: "Data Display",
  status: "Auditing",
  description: "Container for a set of pricing plans.",
  importPath: "@rimelight/ui/components/pricing-table/RLPricingTable.tsx",
  renderSandbox: () => <PricingTableSandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Children in root",
      description: "Real children (text plus a nested element) passed to the root container.",
      render: () => (
        <RLPricingTable>
          <span>Starter, Pro, and Enterprise plans.</span>
          <span class="font-semibold">Billed monthly.</span>
        </RLPricingTable>
      ),
    },
    {
      id: "as-polymorphic",
      title: "Polymorphic as",
      description: "Root rendered as a section element via the as prop.",
      render: () => (
        <RLPricingTable as="section">
          <span>Rendered as section</span>
        </RLPricingTable>
      ),
    },
    {
      id: "class-passthrough",
      title: "Class passthrough",
      description: "Additional class string merged onto the root element.",
      render: () => (
        <RLPricingTable class="p-4 rounded-xl border border-default">
          <span>Custom class applied</span>
        </RLPricingTable>
      ),
    },
    {
      id: "ui-root-override",
      title: "UI root override",
      description: "ui.root slot class applied to the root element.",
      render: () => (
        <RLPricingTable ui={{ root: "p-6" }}>
          <span>Root ui override applied</span>
        </RLPricingTable>
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
      notes: "No style attributes in the RL file; styling resides in pricing-table.theme.ts.",
    },
    {
      criterion: "No hydration-unsafe globals",
      status: "pass",
      notes: "Component body reads only props and theme setup output.",
    },
  ],
};
