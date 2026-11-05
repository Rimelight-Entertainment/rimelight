import type { JSX } from "@solidjs/web";
import { RLWindowMockup } from "@rimelight/ui/components/window-mockup/RLWindowMockup.tsx";
import type { ComponentAuditDefinition } from "./types";

export const WindowMockupSandbox = (): JSX.Element => (
  <div class="flex flex-col gap-6">
    <p class="text-xs text-muted">
      Stub: renders its root and children only. No window chrome or frame is implemented.
    </p>
    <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
      <RLWindowMockup>Stub children</RLWindowMockup>
    </div>
  </div>
);

export const windowMockupAudit: ComponentAuditDefinition = {
  id: "window-mockup",
  name: "Window Mockup",
  category: "Media & Visuals",
  status: "Planned",
  description:
    "Stub. Window Mockup is a placeholder root that renders its children. No window frame chrome is implemented.",
  importPath: "@rimelight/ui/components/window-mockup/RLWindowMockup.tsx",
  renderSandbox: () => <WindowMockupSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (children)",
      description: "Children are rendered inside the root. This is the only slot the stub exposes.",
      render: () => <RLWindowMockup>Stub children</RLWindowMockup>,
    },
  ],
};
