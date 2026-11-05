import type { JSX } from "@solidjs/web";
import { RLCommandPalette } from "@rimelight/ui/components/command-palette/RLCommandPalette.tsx";
import type { ComponentAuditDefinition } from "./types";

export const CommandPaletteSandbox = (): JSX.Element => (
  <RLCommandPalette>
    <span class="text-sm text-muted">Command palette is a stub; children render as-is.</span>
  </RLCommandPalette>
);

export const commandPaletteAudit: ComponentAuditDefinition = {
  id: "command-palette",
  name: "Command Palette",
  category: "Overlay & Dialog",
  status: "Planned",
  description:
    "Stub: the component has no functional build-out yet. It renders its children inside a root element and exposes no other props.",
  importPath: "@rimelight/ui/components/command-palette/RLCommandPalette.tsx",
  renderSandbox: () => <CommandPaletteSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render inside the root. No other behavior exists yet.",
      render: () => (
        <RLCommandPalette>
          <span class="text-sm text-muted">Stub content</span>
        </RLCommandPalette>
      ),
    },
  ],
};
