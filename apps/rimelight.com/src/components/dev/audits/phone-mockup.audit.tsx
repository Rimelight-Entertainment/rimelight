import type { JSX } from "@solidjs/web";
import { RLPhoneMockup } from "@rimelight/ui/components/phone-mockup/RLPhoneMockup.tsx";
import type { ComponentAuditDefinition } from "./types";

export const PhoneMockupSandbox = (): JSX.Element => (
  <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
    <RLPhoneMockup>
      <span>Screen content preview</span>
    </RLPhoneMockup>
  </div>
);

export const phoneMockupAudit: ComponentAuditDefinition = {
  id: "phone-mockup",
  name: "PhoneMockup",
  category: "Media & Visuals",
  status: "Auditing",
  description: "Phone frame container for displaying content inside a device mockup.",
  importPath: "@rimelight/ui/components/phone-mockup/RLPhoneMockup.tsx",
  renderSandbox: () => <PhoneMockupSandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Children in root",
      description: "Real children (text plus a nested element) passed to the root container.",
      render: () => (
        <RLPhoneMockup>
          <span>App screen content</span>
          <span class="font-semibold">Nested element</span>
        </RLPhoneMockup>
      ),
    },
    {
      id: "as-polymorphic",
      title: "Polymorphic as",
      description: "Root rendered as a section element via the as prop.",
      render: () => (
        <RLPhoneMockup as="section">
          <span>Rendered as section</span>
        </RLPhoneMockup>
      ),
    },
    {
      id: "class-passthrough",
      title: "Class passthrough",
      description: "Additional class string merged onto the root element.",
      render: () => (
        <RLPhoneMockup class="p-4 rounded-xl border border-default">
          <span>Custom class applied</span>
        </RLPhoneMockup>
      ),
    },
    {
      id: "ui-root-override",
      title: "UI root override",
      description: "ui.root slot class applied to the root element.",
      render: () => (
        <RLPhoneMockup ui={{ root: "p-6" }}>
          <span>Root ui override applied</span>
        </RLPhoneMockup>
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
      notes: "No style attributes in the RL file; styling resides in phone-mockup.theme.ts.",
    },
    {
      criterion: "No hydration-unsafe globals",
      status: "pass",
      notes: "Component body reads only props and theme setup output.",
    },
  ],
};
