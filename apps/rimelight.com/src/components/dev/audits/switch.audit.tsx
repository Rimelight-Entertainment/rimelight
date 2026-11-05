import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLSwitch } from "@rimelight/ui/components/switch/RLSwitch.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const COLORS = ["primary", "success", "error", "neutral"] as const;

export const SwitchSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [color, setColor] = createSignal<(typeof COLORS)[number]>("primary");
  const [checked, setChecked] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [label, setLabel] = createSignal("Email notifications");

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-muted">Size</span>
          <For each={SIZES}>
            {(option) => (
              <button
                type="button"
                class={`px-2 py-1 rounded border border-default ${size() === option ? "bg-elevated" : ""}`}
                onClick={() => setSize(option)}
              >
                {option}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-semibold text-muted">Color</span>
          <For each={COLORS}>
            {(option) => (
              <button
                type="button"
                class={`px-2 py-1 rounded border border-default ${color() === option ? "bg-elevated" : ""}`}
                onClick={() => setColor(option)}
              >
                {option}
              </button>
            )}
          </For>
        </div>
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            checked={checked()}
            onChange={(event) => setChecked(event.currentTarget.checked)}
          />
          checked
        </label>
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            checked={disabled()}
            onChange={(event) => setDisabled(event.currentTarget.checked)}
          />
          disabled
        </label>
        <label class="flex items-center gap-1">
          label
          <input
            type="text"
            class="px-2 py-1 rounded border border-default bg-default"
            value={label()}
            onInput={(event) => setLabel(event.currentTarget.value)}
          />
        </label>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 w-full max-w-md">
        <RLSwitch
          size={size()}
          color={color()}
          checked={checked()}
          disabled={disabled()}
          label={label()}
          onValueChange={setChecked}
        />
      </div>
    </div>
  );
};

const ControlledExample = (): JSX.Element => {
  const [on, setOn] = createSignal(false);
  return <RLSwitch checked={on()} onValueChange={setOn} label={on() ? "On" : "Off"} />;
};

export const switchAudit: ComponentAuditDefinition = {
  id: "switch",
  name: "Switch",
  category: "Form & Input",
  status: "Auditing",
  description:
    "A binary toggle built on a native checkbox with a track and thumb, size and color variants, and an optional label.",
  importPath: "@rimelight/ui/components/switch/RLSwitch.tsx",
  renderSandbox: () => <SwitchSandbox />,
  testScenarios: [
    {
      id: "unchecked",
      title: "Unchecked",
      description: "Default off state.",
      render: () => <RLSwitch aria-label="Notifications" />,
    },
    {
      id: "checked",
      title: "Checked",
      description: "Starts on through defaultChecked.",
      render: () => <RLSwitch defaultChecked aria-label="Notifications" />,
    },
    {
      id: "label-prop",
      title: "Label prop",
      description: "Visible label text rendered from the label prop.",
      render: () => <RLSwitch label="Email notifications" />,
    },
    {
      id: "children",
      title: "Children (default slot)",
      description: "Children render as the visible label when no label prop is given.",
      render: () => <RLSwitch>Dark mode</RLSwitch>,
    },
    {
      id: "sizes",
      title: "Size variants",
      description: "All size variants from xs to xl.",
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={SIZES}>{(option) => <RLSwitch size={option} label={`Size ${option}`} />}</For>
        </div>
      ),
    },
    {
      id: "colors",
      title: "Color variants",
      description: "Checked track uses the selected palette.",
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={COLORS}>
            {(option) => <RLSwitch color={option} defaultChecked label={option} />}
          </For>
        </div>
      ),
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Both unchecked and checked disabled states.",
      render: () => (
        <div class="flex flex-col gap-3">
          <RLSwitch disabled label="Disabled off" />
          <RLSwitch disabled defaultChecked label="Disabled on" />
        </div>
      ),
    },
    {
      id: "controlled",
      title: "Controlled",
      description: "Checked state owned by the parent and updated through onValueChange.",
      render: () => <ControlledExample />,
    },
  ],
};
