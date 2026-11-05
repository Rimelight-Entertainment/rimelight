import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLSlider } from "@rimelight/ui/components/slider/RLSlider.tsx";
import type { ComponentAuditDefinition } from "./types";

export const SliderSandbox = (): JSX.Element => {
  const [value, setValue] = createSignal(40);
  const [orientation, setOrientation] = createSignal<"horizontal" | "vertical">("horizontal");
  const [disabled, setDisabled] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={orientation() === "vertical"}
            onChange={(e) => setOrientation(e.currentTarget.checked ? "vertical" : "horizontal")}
          />
          Vertical
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={disabled()}
            onChange={(e) => setDisabled(e.currentTarget.checked)}
          />
          Disabled
        </label>
        <span class="font-mono">value: {value()}</span>
      </div>
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex justify-center">
        <RLSlider
          value={value()}
          onValueChange={setValue}
          orientation={orientation()}
          disabled={disabled()}
          aria-label="Sandbox slider"
          class={orientation() === "vertical" ? "h-48" : "w-full max-w-md"}
        />
      </div>
    </div>
  );
};

export const sliderAudit: ComponentAuditDefinition = {
  id: "slider",
  name: "Slider",
  category: "Form & Input",
  status: "Auditing",
  description:
    "A single-value range input built on a native range control, with horizontal or vertical orientation, min/max/step, and disabled state.",
  importPath: "@rimelight/ui/components/slider/RLSlider.tsx",
  renderSandbox: () => <SliderSandbox />,
  testScenarios: [
    {
      id: "uncontrolled",
      title: "Uncontrolled",
      description: "Starts at defaultValue and tracks the thumb internally.",
      render: () => <RLSlider defaultValue={25} aria-label="Uncontrolled slider" />,
    },
    {
      id: "stepped",
      title: "Min, max, step",
      description: "Range 0 to 100 in steps of 10.",
      render: () => (
        <RLSlider defaultValue={50} min={0} max={100} step={10} aria-label="Stepped slider" />
      ),
    },
    {
      id: "vertical",
      title: "Vertical",
      description: "Vertical orientation in a fixed-height container.",
      render: () => (
        <div class="h-40">
          <RLSlider defaultValue={70} orientation="vertical" aria-label="Vertical slider" />
        </div>
      ),
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Thumb and track are not interactive.",
      render: () => <RLSlider defaultValue={30} disabled aria-label="Disabled slider" />,
    },
  ],
  checklist: [
    { criterion: "Keyboard arrows change value via native range", status: "pending" },
    { criterion: "Vertical orientation maps top to max", status: "pending" },
    { criterion: "Disabled blocks pointer and keyboard input", status: "pending" },
  ],
};
