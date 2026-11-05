import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLColorField } from "@rimelight/ui/components/color-field/RLColorField.tsx";
import type { ComponentAuditDefinition } from "./types";

export const ColorFieldSandbox = (): JSX.Element => {
  const [value, setValue] = createSignal("#3b82f6");

  return (
    <div class="flex flex-col gap-6">
      <RLColorField
        aria-label="Color value"
        name="color"
        value={value()}
        onValueChange={setValue}
        step={1}
      />
      <span class="text-xs font-mono text-muted">{value()}</span>
    </div>
  );
};

export const colorFieldAudit: ComponentAuditDefinition = {
  id: "color-field",
  name: "Color Field",
  category: "Form & Input",
  status: "Auditing",
  description:
    "A text input bound to one color channel with a swatch preview, color space selection, controlled or uncontrolled hex value, and keyboard and wheel stepping.",
  importPath: "@rimelight/ui/components/color-field/RLColorField.tsx",
  renderSandbox: () => <ColorFieldSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render after the input.",
      render: () => (
        <RLColorField aria-label="Default">
          <p class="text-xs text-muted">Helper text rendered after the field.</p>
        </RLColorField>
      ),
    },
    {
      id: "channel-hue-hsl",
      title: "Channel: hue (hsl)",
      description: "Edits the hue channel in the hsl color space (default).",
      render: () => <RLColorField channel="hue" colorSpace="hsl" aria-label="Hue" />,
    },
    {
      id: "channel-red-rgb",
      title: "Channel: red (rgb)",
      description: "Edits the red channel in the rgb color space.",
      render: () => <RLColorField channel="red" colorSpace="rgb" aria-label="Red" />,
    },
    {
      id: "channel-brightness-hsb",
      title: "Channel: brightness (hsb)",
      description: "Edits the brightness channel in the hsb color space.",
      render: () => <RLColorField channel="brightness" colorSpace="hsb" aria-label="Brightness" />,
    },
    {
      id: "controlled-value",
      title: "Controlled value",
      description: "Hex value controlled through value and onValueChange.",
      render: () => {
        const [value, setValue] = createSignal("#22c55e");
        return (
          <div class="flex flex-col gap-2">
            <RLColorField value={value()} onValueChange={setValue} aria-label="Controlled" />
            <span class="text-xs font-mono text-muted">{value()}</span>
          </div>
        );
      },
    },
    {
      id: "default-value",
      title: "Default value",
      description: "Uncontrolled initial hex value.",
      render: () => <RLColorField defaultValue="#f59e0b" aria-label="Default value" />,
    },
    {
      id: "step",
      title: "Step",
      description: "Custom step size (Shift multiplies it by 10).",
      render: () => <RLColorField step={5} aria-label="Step 5" />,
    },
    {
      id: "placeholder-and-name",
      title: "Placeholder and name",
      description: "Placeholder text and form name on the input.",
      render: () => <RLColorField placeholder="#000000" name="brand" aria-label="Brand" />,
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Field disabled.",
      render: () => <RLColorField disabled aria-label="Disabled" />,
    },
    {
      id: "readonly",
      title: "Readonly",
      description: "Field readonly.",
      render: () => <RLColorField readonly aria-label="Readonly" />,
    },
    {
      id: "required",
      title: "Required",
      description: "Field required.",
      render: () => <RLColorField required aria-label="Required" />,
    },
    {
      id: "disable-wheel-change",
      title: "Disable wheel change",
      description: "Mouse wheel does not change the value.",
      render: () => <RLColorField disableWheelChange aria-label="No wheel" />,
    },
    {
      id: "color-auto",
      title: "Color auto",
      description: "Color variant set to auto.",
      render: () => <RLColorField color="auto" aria-label="Auto" />,
    },
  ],
};
