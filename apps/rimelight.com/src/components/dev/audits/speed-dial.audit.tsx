import type { JSX } from "@solidjs/web";
import { RLSpeedDial } from "@rimelight/ui/components/speed-dial/RLSpeedDial.tsx";
import type { ComponentAuditDefinition } from "./types";

export const SpeedDialSandbox = (): JSX.Element => (
  <div class="flex flex-col gap-6">
    <p class="text-xs text-muted">
      Stub: renders its root and children only. No speed-dial actions or open state are implemented.
    </p>
    <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
      <RLSpeedDial>Stub children</RLSpeedDial>
    </div>
  </div>
);

export const speedDialAudit: ComponentAuditDefinition = {
  id: "speed-dial",
  name: "Speed Dial",
  category: "Navigation",
  status: "Planned",
  description:
    "Stub. Speed Dial is a placeholder root that renders its children. No floating action menu behavior is implemented.",
  importPath: "@rimelight/ui/components/speed-dial/RLSpeedDial.tsx",
  renderSandbox: () => <SpeedDialSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (children)",
      description: "Children are rendered inside the root. This is the only slot the stub exposes.",
      render: () => <RLSpeedDial>Stub children</RLSpeedDial>,
    },
  ],
};
