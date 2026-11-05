import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLColorSlider } from "@rimelight/ui/components/color-slider/RLColorSlider.tsx";
import type { ComponentAuditDefinition } from "./types";

const ORIENTATIONS = ["horizontal", "vertical"] as const;

export const ColorSliderSandbox = (): JSX.Element => {
  const [value, setValue] = createSignal("#3b82f6");
  const [orientation, setOrientation] = createSignal<(typeof ORIENTATIONS)[number]>("horizontal");

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-2 text-xs">
        <span class="text-muted mr-1">orientation</span>
        <For each={ORIENTATIONS}>
          {(o) => (
            <button
              type="button"
              onClick={() => setOrientation(o)}
              class={`px-2 py-0.5 rounded text-xs font-mono ${
                orientation() === o
                  ? "bg-primary text-inverted"
                  : "bg-elevated text-muted border border-default"
              }`}
            >
              {o}
            </button>
          )}
        </For>
      </div>
      <RLColorSlider
        channel="hue"
        orientation={orientation()}
        value={value()}
        onValueChange={setValue}
        aria-label="Hue"
      />
      <span class="text-xs font-mono text-muted">{value()}</span>
    </div>
  );
};

export const colorSliderAudit: ComponentAuditDefinition = {
  id: "color-slider",
  name: "Color Slider",
  category: "Form & Input",
  status: "Auditing",
  description:
    "A slider for one color channel with a gradient track, a thumb, horizontal or vertical orientation, color space selection, inverted mode, and controlled or uncontrolled hex value.",
  importPath: "@rimelight/ui/components/color-slider/RLColorSlider.tsx",
  renderSandbox: () => <ColorSliderSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render after the slider.",
      render: () => (
        <RLColorSlider channel="hue" aria-label="Default">
          <p class="text-xs text-muted">Helper text rendered after the slider.</p>
        </RLColorSlider>
      ),
    },
    {
      id: "channel-hue",
      title: "Channel: hue",
      description: "Hue channel in the hsl color space (default).",
      render: () => <RLColorSlider channel="hue" aria-label="Hue" />,
    },
    {
      id: "channel-saturation",
      title: "Channel: saturation",
      description: "Saturation channel in the hsl color space.",
      render: () => <RLColorSlider channel="saturation" colorSpace="hsl" aria-label="Saturation" />,
    },
    {
      id: "channel-blue-rgb",
      title: "Channel: blue (rgb)",
      description: "Blue channel in the rgb color space.",
      render: () => <RLColorSlider channel="blue" colorSpace="rgb" aria-label="Blue" />,
    },
    {
      id: "channel-brightness-hsb",
      title: "Channel: brightness (hsb)",
      description: "Brightness channel in the hsb color space.",
      render: () => <RLColorSlider channel="brightness" colorSpace="hsb" aria-label="Brightness" />,
    },
    {
      id: "channel-alpha",
      title: "Channel: alpha",
      description: "Alpha channel.",
      render: () => <RLColorSlider channel="alpha" aria-label="Alpha" />,
    },
    {
      id: "orientation-vertical",
      title: "Orientation: vertical",
      description: "Vertical slider.",
      render: () => (
        <div class="h-48">
          <RLColorSlider channel="hue" orientation="vertical" aria-label="Vertical hue" />
        </div>
      ),
    },
    {
      id: "inverted",
      title: "Inverted",
      description: "Inverted direction of the channel range.",
      render: () => <RLColorSlider channel="lightness" inverted aria-label="Inverted" />,
    },
    {
      id: "controlled-value",
      title: "Controlled value",
      description: "Hex value controlled through value and onValueChange.",
      render: () => {
        const [value, setValue] = createSignal("#22c55e");
        return (
          <div class="flex flex-col gap-2">
            <RLColorSlider
              channel="hue"
              value={value()}
              onValueChange={setValue}
              aria-label="Controlled"
            />
            <span class="text-xs font-mono text-muted">{value()}</span>
          </div>
        );
      },
    },
    {
      id: "default-value",
      title: "Default value",
      description: "Uncontrolled initial hex value.",
      render: () => (
        <RLColorSlider channel="hue" defaultValue="#f59e0b" aria-label="Default value" />
      ),
    },
    {
      id: "step",
      title: "Step",
      description: "Custom step size in channel units.",
      render: () => <RLColorSlider channel="hue" step={10} aria-label="Step 10" />,
    },
    {
      id: "name",
      title: "Form name",
      description: "Hidden input carries the hex value under this name.",
      render: () => <RLColorSlider channel="hue" name="hue" aria-label="Named" />,
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Pointer and keyboard interaction disabled.",
      render: () => <RLColorSlider channel="hue" disabled aria-label="Disabled" />,
    },
    {
      id: "color-auto",
      title: "Color auto",
      description: "Color variant set to auto.",
      render: () => <RLColorSlider channel="hue" color="auto" aria-label="Auto" />,
    },
  ],
};
