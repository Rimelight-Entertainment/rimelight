import type { JSX } from "@solidjs/web";
import { RLQrCode } from "@rimelight/ui/components/qr-code/RLQrCode.tsx";
import type { ComponentAuditDefinition } from "./types";

export const QrCodeSandbox = (): JSX.Element => (
  <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
    <RLQrCode>
      <span>https://rimelight.com</span>
    </RLQrCode>
  </div>
);

export const qrCodeAudit: ComponentAuditDefinition = {
  id: "qr-code",
  name: "QrCode",
  category: "Media & Visuals",
  status: "Auditing",
  description: "QR code container for rendering a scannable code within the themed root.",
  importPath: "@rimelight/ui/components/qr-code/RLQrCode.tsx",
  renderSandbox: () => <QrCodeSandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Children in root",
      description: "Real children (text plus a nested element) passed to the root container.",
      render: () => (
        <RLQrCode>
          <span>Scan to visit</span>
          <span class="font-semibold">rimelight.com</span>
        </RLQrCode>
      ),
    },
    {
      id: "as-polymorphic",
      title: "Polymorphic as",
      description: "Root rendered as a section element via the as prop.",
      render: () => (
        <RLQrCode as="section">
          <span>Rendered as section</span>
        </RLQrCode>
      ),
    },
    {
      id: "class-passthrough",
      title: "Class passthrough",
      description: "Additional class string merged onto the root element.",
      render: () => (
        <RLQrCode class="p-4 rounded-xl border border-default">
          <span>Custom class applied</span>
        </RLQrCode>
      ),
    },
    {
      id: "ui-root-override",
      title: "UI root override",
      description: "ui.root slot class applied to the root element.",
      render: () => (
        <RLQrCode ui={{ root: "p-6" }}>
          <span>Root ui override applied</span>
        </RLQrCode>
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
      notes: "No style attributes in the RL file; styling resides in qr-code.theme.ts.",
    },
    {
      criterion: "No hydration-unsafe globals",
      status: "pass",
      notes: "Component body reads only props and theme setup output.",
    },
  ],
};
