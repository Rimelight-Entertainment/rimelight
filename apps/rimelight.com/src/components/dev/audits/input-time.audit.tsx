import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLInputTime } from "@rimelight/ui/components/input-time/RLInputTime.tsx";
import type { ComponentAuditDefinition, TestScenario } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const InputTimeSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [disabled, setDisabled] = createSignal(false);
  const [value, setValue] = createSignal("09:30");

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <For each={SIZES}>
          {(s) => (
            <button type="button" onClick={() => setSize(s)}>
              size: {s}
            </button>
          )}
        </For>
        <button type="button" onClick={() => setDisabled((v) => !v)}>
          disabled: {disabled() ? "on" : "off"}
        </button>
        <span>value: {value()}</span>
      </div>
      <RLInputTime
        size={size()}
        disabled={disabled()}
        value={value()}
        min="08:00"
        max="18:00"
        step={900}
        onValueChange={setValue}
      />
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default-slot",
    title: "Default slot (children)",
    description: "Children render after the time input inside the root.",
    render: () => (
      <RLInputTime defaultValue="12:00">
        <span>Local time</span>
      </RLInputTime>
    ),
  },
  {
    id: "value-props",
    title: "value and defaultValue",
    description: "value is controlled; defaultValue seeds an uncontrolled input.",
    render: () => (
      <div class="flex flex-col gap-3">
        <RLInputTime value="14:45" onValueChange={() => {}} />
        <RLInputTime defaultValue="07:15" />
      </div>
    ),
  },
  {
    id: "constraints",
    title: "min, max, step",
    description: "Native time constraints. step is in seconds.",
    render: () => <RLInputTime min="08:00" max="18:00" step={900} />,
  },
  {
    id: "form-attributes",
    title: "name, placeholder, required, readonly",
    description: "Form attributes pass through to the native input.",
    render: () => (
      <div class="flex flex-col gap-3">
        <RLInputTime name="start-time" required />
        <RLInputTime name="end-time" placeholder="HH:MM" readonly defaultValue="17:00" />
      </div>
    ),
  },
  {
    id: "disabled",
    title: "disabled",
    description: "Disabled input cannot be changed.",
    render: () => <RLInputTime disabled defaultValue="10:00" />,
  },
  {
    id: "sizes",
    title: "Every size",
    description: "xs, sm, md (default), lg, and xl.",
    render: () => (
      <div class="flex flex-col gap-3">
        <For each={SIZES}>{(s) => <RLInputTime size={s} defaultValue="09:00" />}</For>
      </div>
    ),
  },
  {
    id: "events",
    title: "Event handlers",
    description:
      "onValueChange, onInput, onFocus, onBlur, and onKeyDown are wired. Each logs to the console.",
    render: () => (
      <RLInputTime
        defaultValue="11:00"
        onValueChange={(v) => console.info("onValueChange", v)}
        onInput={() => console.info("onInput")}
        onFocus={() => console.info("onFocus")}
        onBlur={() => console.info("onBlur")}
        onKeyDown={() => console.info("onKeyDown")}
      />
    ),
  },
];

export const inputTimeAudit: ComponentAuditDefinition = {
  id: "input-time",
  name: "Input Time",
  category: "Form & Input",
  status: "Auditing",
  description: "Native time input styled with the input size scale.",
  importPath: "@rimelight/ui/components/input-time/RLInputTime.tsx",
  renderSandbox: () => <InputTimeSandbox />,
  testScenarios,
};
