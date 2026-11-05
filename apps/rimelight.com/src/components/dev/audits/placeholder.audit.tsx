import type { JSX } from "@solidjs/web";
import { RLPlaceholder } from "@rimelight/ui/components/placeholder/RLPlaceholder.tsx";
import type { ComponentAuditDefinition } from "./types";

export const PlaceholderSandbox = (): JSX.Element => {
  return (
    <div class="flex flex-col gap-6">
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        <RLPlaceholder class="min-h-40 w-full flex items-center justify-center">
          <span>
            Placeholder text child <strong>nested element</strong>
          </span>
        </RLPlaceholder>
      </div>
    </div>
  );
};

export const placeholderAudit: ComponentAuditDefinition = {
  id: "placeholder",
  name: "Placeholder",
  category: "Media & Visuals",
  status: "Auditing",
  description: "Dashed placeholder frame with a diagonal hatched SVG pattern behind its children.",
  importPath: "@rimelight/ui/components/placeholder/RLPlaceholder.tsx",
  renderSandbox: () => <PlaceholderSandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Children on root",
      description: "Text and a nested element passed as children render above the hatched pattern.",
      render: () => (
        <RLPlaceholder>
          <span>
            Placeholder text child <strong>nested element</strong>
          </span>
        </RLPlaceholder>
      ),
    },
    {
      id: "id-passthrough",
      title: "id passthrough",
      description: "The id prop passes through to the root; the pattern id derives from it.",
      render: () => (
        <RLPlaceholder id="placeholder-demo">
          <span>
            Id passthrough <strong>nested element</strong>
          </span>
        </RLPlaceholder>
      ),
    },
    {
      id: "class-passthrough",
      title: "class passthrough",
      description: "A class prop is applied to the root alongside themed classes.",
      render: () => (
        <RLPlaceholder class="border-2 border-primary">
          <span>
            Custom class root <strong>nested element</strong>
          </span>
        </RLPlaceholder>
      ),
    },
    {
      id: "ui-root-override",
      title: "ui root override",
      description: "The ui.root prop overrides the root slot classes.",
      render: () => (
        <RLPlaceholder ui={{ root: "outline-2 outline-primary" }}>
          <span>
            ui.root override <strong>nested element</strong>
          </span>
        </RLPlaceholder>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Functional implementation",
      status: "pass",
      notes: "Fully built: dashed frame with diagonal hatched SVG pattern behind children.",
    },
    {
      criterion: "Pattern id uses createUniqueId-derived id",
      status: "pass",
      notes:
        "Pattern id derives from RLPlaceholderTheme.id via setup, with idPrefix rl-placeholder.",
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
      notes: "Requires verification of placeholder.theme.ts output.",
    },
    {
      criterion: "No hydration-unsafe globals",
      status: "pending",
      notes: "Requires verification of module-level side effects.",
    },
  ],
};
