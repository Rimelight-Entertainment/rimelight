import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLColorPicker } from "@rimelight/ui/components/color-picker/RLColorPicker.tsx";
import type { ComponentAuditDefinition } from "./types";

export const ColorPickerSandbox = (): JSX.Element => {
  const [color, setColor] = createSignal("#ff0000");

  return (
    <div class="flex flex-col gap-3 max-w-sm w-full">
      <RLColorPicker value={color()} onValueChange={setColor} />
      <p class="text-xs text-muted">Selected: {color()}</p>
    </div>
  );
};

export const colorPickerAudit: ComponentAuditDefinition = {
  id: "color-picker",
  name: "Color Picker",
  category: "Form & Input",
  status: "Auditing",
  description: "Combines a color area, a hue slider, and a hex field around one color value.",
  importPath: "@rimelight/ui/components/color-picker/RLColorPicker.tsx",
  renderSandbox: () => <ColorPickerSandbox />,
  testScenarios: [
    {
      id: "default",
      title: "Default",
      description: "Uncontrolled picker starting from the default color.",
      render: () => <RLColorPicker />,
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "All controls disabled.",
      render: () => <RLColorPicker defaultValue="#3366ff" disabled />,
    },
  ],
  checklist: [
    { criterion: "Area, hue, and hex field stay in sync with one value", status: "pending" },
    { criterion: "onValueChange receives the hex string on every change", status: "pending" },
    { criterion: "Disabled flag reaches every control", status: "pending" },
  ],
};
