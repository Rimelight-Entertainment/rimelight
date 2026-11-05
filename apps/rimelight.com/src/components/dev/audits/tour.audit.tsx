import type { JSX } from "@solidjs/web";
import { RLTour } from "@rimelight/ui/components/tour/RLTour.tsx";
import type { ComponentAuditDefinition } from "./types";

export const TourSandbox = (): JSX.Element => (
  <div class="flex flex-col gap-6">
    <p class="text-xs text-muted">
      Stub: renders its root and children only. No step, highlight, or overlay behavior is
      implemented.
    </p>
    <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
      <RLTour>Stub children</RLTour>
    </div>
  </div>
);

export const tourAudit: ComponentAuditDefinition = {
  id: "tour",
  name: "Tour",
  category: "Overlay & Dialog",
  status: "Planned",
  description:
    "Stub. Tour is a placeholder root that renders its children. No guided step behavior is implemented.",
  importPath: "@rimelight/ui/components/tour/RLTour.tsx",
  renderSandbox: () => <TourSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (children)",
      description: "Children are rendered inside the root. This is the only slot the stub exposes.",
      render: () => <RLTour>Stub children</RLTour>,
    },
  ],
};
