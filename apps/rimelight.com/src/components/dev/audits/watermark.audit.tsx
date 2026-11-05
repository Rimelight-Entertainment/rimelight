import type { JSX } from "@solidjs/web";
import { RLWatermark } from "@rimelight/ui/components/watermark/RLWatermark.tsx";
import type { ComponentAuditDefinition } from "./types";

export const WatermarkSandbox = (): JSX.Element => (
  <div class="flex flex-col gap-6">
    <p class="text-xs text-muted">
      Stub: renders its root and children only. No watermark overlay is implemented.
    </p>
    <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
      <RLWatermark>Stub children</RLWatermark>
    </div>
  </div>
);

export const watermarkAudit: ComponentAuditDefinition = {
  id: "watermark",
  name: "Watermark",
  category: "Media & Visuals",
  status: "Planned",
  description:
    "Stub. Watermark is a placeholder root that renders its children. No overlay or tiling behavior is implemented.",
  importPath: "@rimelight/ui/components/watermark/RLWatermark.tsx",
  renderSandbox: () => <WatermarkSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (children)",
      description: "Children are rendered inside the root. This is the only slot the stub exposes.",
      render: () => <RLWatermark>Stub children</RLWatermark>,
    },
  ],
};
