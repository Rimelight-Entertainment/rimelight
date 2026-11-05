import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLColorArea } from "@rimelight/ui/components/color-area/RLColorArea.tsx";
import type { ComponentAuditDefinition } from "./types";

const COLOR_SPACES = ["hsl", "rgb", "hsb"] as const;

export const ColorAreaSandbox = (): JSX.Element => {
  const [colorSpace, setColorSpace] = createSignal<(typeof COLOR_SPACES)[number]>("hsl");
  const [disabled, setDisabled] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-2 text-xs">
        <span class="text-muted mr-1">colorSpace</span>
        <For each={COLOR_SPACES}>
          {(cs) => (
            <button
              type="button"
              onClick={() => setColorSpace(cs)}
              class={`px-2 py-0.5 rounded text-xs font-mono ${
                colorSpace() === cs
                  ? "bg-primary text-inverted"
                  : "bg-elevated text-muted border border-default"
              }`}
            >
              {cs}
            </button>
          )}
        </For>
        <button
          type="button"
          onClick={() => setDisabled((d) => !d)}
          class="px-2 py-0.5 rounded text-xs font-mono bg-elevated text-muted border border-default"
        >
          {disabled() ? "disabled" : "enabled"}
        </button>
      </div>
      <RLColorArea
        colorSpace={colorSpace()}
        disabled={disabled()}
        aria-label="Saturation and lightness"
        name="color"
      />
    </div>
  );
};

export const colorAreaAudit: ComponentAuditDefinition = {
  id: "color-area",
  name: "Color Area",
  category: "Form & Input",
  status: "Auditing",
  description:
    "A two-dimensional color picker area with x and y channels, color space selection, controlled or uncontrolled hex value, and a disabled state.",
  importPath: "@rimelight/ui/components/color-area/RLColorArea.tsx",
  renderSandbox: () => <ColorAreaSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render after the color area.",
      render: () => (
        <RLColorArea aria-label="Default">
          <p class="text-xs text-muted">Helper text rendered after the area.</p>
        </RLColorArea>
      ),
    },
    {
      id: "color-space-hsl",
      title: "Color space: hsl",
      description: "HSL color space (default).",
      render: () => <RLColorArea colorSpace="hsl" aria-label="HSL" />,
    },
    {
      id: "color-space-rgb",
      title: "Color space: rgb",
      description: "RGB color space with red and green channels.",
      render: () => (
        <RLColorArea colorSpace="rgb" xChannel="red" yChannel="green" aria-label="RGB" />
      ),
    },
    {
      id: "color-space-hsb",
      title: "Color space: hsb",
      description: "HSB color space with saturation and brightness channels.",
      render: () => (
        <RLColorArea
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
          aria-label="HSB"
        />
      ),
    },
    {
      id: "controlled-value",
      title: "Controlled value",
      description: "Hex value controlled through value and onValueChange.",
      render: () => {
        const [value, setValue] = createSignal("#3b82f6");
        return (
          <div class="flex flex-col gap-2">
            <RLColorArea value={value()} onValueChange={setValue} aria-label="Controlled" />
            <span class="text-xs font-mono text-muted">{value()}</span>
          </div>
        );
      },
    },
    {
      id: "default-value",
      title: "Default value",
      description: "Uncontrolled initial hex value.",
      render: () => <RLColorArea defaultValue="#22c55e" aria-label="Default value" />,
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Pointer and keyboard interaction disabled.",
      render: () => <RLColorArea disabled aria-label="Disabled" />,
    },
    {
      id: "color-auto",
      title: "Color auto",
      description: "Color variant set to auto.",
      render: () => <RLColorArea color="auto" aria-label="Auto" />,
    },
  ],
};
