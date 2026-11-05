import type { JSX } from "@solidjs/web";
import { RLContainer } from "@rimelight/ui/components/container/RLContainer.tsx";
import type { ComponentAuditDefinition } from "./types";

export const ContainerSandbox = (): JSX.Element => (
  <RLContainer>
    <div class="rounded-lg border border-default bg-elevated/20 p-4 text-sm text-muted">
      Content constrained by the container max width and responsive padding.
    </div>
  </RLContainer>
);

export const containerAudit: ComponentAuditDefinition = {
  id: "container",
  name: "Container",
  category: "Layout",
  status: "Auditing",
  description:
    "Centers content at the layout max width with responsive horizontal padding. It has no variants and renders its children in the default slot.",
  importPath: "@rimelight/ui/components/container/RLContainer.tsx",
  renderSandbox: () => <ContainerSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render inside the centered, padded container.",
      render: () => (
        <RLContainer>
          <div class="rounded-lg border border-default bg-elevated/20 p-4 text-sm text-muted">
            Container child content.
          </div>
        </RLContainer>
      ),
    },
    {
      id: "wide-content",
      title: "Wide content",
      description: "Content wider than the max width is capped by the container.",
      render: () => (
        <RLContainer>
          <div class="h-12 w-full rounded bg-primary/20" />
        </RLContainer>
      ),
    },
  ],
};
