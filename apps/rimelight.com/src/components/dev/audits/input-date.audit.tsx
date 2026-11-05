import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLInputDate } from "@rimelight/ui/components/input-date/RLInputDate.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export const InputDateSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [disabled, setDisabled] = createSignal(false);
  const [readonly, setReadonly] = createSignal(false);
  const [value, setValue] = createSignal("2026-01-15");

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2 text-xs">
        <For each={SIZES}>
          {(s) => (
            <button type="button" onClick={() => setSize(s)}>
              size: {s}
            </button>
          )}
        </For>
        <button type="button" onClick={() => setDisabled((v) => !v)}>
          disabled: {String(disabled())}
        </button>
        <button type="button" onClick={() => setReadonly((v) => !v)}>
          readonly: {String(readonly())}
        </button>
      </div>
      <RLInputDate
        size={size()}
        value={value()}
        onValueChange={setValue}
        min="2025-01-01"
        max="2030-12-31"
        step={1}
        disabled={disabled()}
        readonly={readonly()}
        aria-label="Event date"
      />
      <span class="text-xs">value: {value()}</span>
    </div>
  );
};

export const inputDateAudit: ComponentAuditDefinition = {
  id: "input-date",
  name: "Input Date",
  category: "Form & Input",
  status: "Auditing",
  description:
    "Native date input styled to match RLInput, with controlled and uncontrolled values, min, max, step, and value change callbacks.",
  importPath: "@rimelight/ui/components/input-date/RLInputDate.tsx",
  renderSandbox: () => <InputDateSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot children",
      description: "Children render next to the native date input. Passes a helper text node.",
      render: () => (
        <RLInputDate aria-label="Start date">
          <span class="text-xs">Helper text rendered as children</span>
        </RLInputDate>
      ),
    },
    {
      id: "uncontrolled",
      title: "defaultValue (uncontrolled)",
      description: "Initial value without a controlled value prop.",
      render: () => <RLInputDate defaultValue="2026-03-01" name="start" aria-label="Start date" />,
    },
    {
      id: "controlled",
      title: "value with onValueChange",
      description: "Controlled value. onValueChange receives the new date string.",
      render: () => {
        const [value, setValue] = createSignal("2026-06-10");
        return (
          <div class="flex flex-col gap-2">
            <RLInputDate value={value()} onValueChange={setValue} aria-label="Controlled date" />
            <span class="text-xs">{value()}</span>
          </div>
        );
      },
    },
    {
      id: "min-max-step",
      title: "min, max, step",
      description: "Bounds and step set on the native input.",
      render: () => (
        <RLInputDate min="2025-01-01" max="2025-12-31" step={7} aria-label="Bounded date" />
      ),
    },
    {
      id: "states",
      title: "disabled and readonly",
      description: "Each state flag on its own input.",
      render: () => (
        <div class="flex flex-col gap-2">
          <RLInputDate disabled={true} defaultValue="2026-01-01" aria-label="Disabled date" />
          <RLInputDate readonly={true} defaultValue="2026-01-01" aria-label="Readonly date" />
          <RLInputDate required={true} aria-label="Required date" />
        </div>
      ),
    },
    {
      id: "aria-attributes",
      title: "aria-labelledby and aria-describedby",
      description: "Label and description IDs applied to the native input.",
      render: () => (
        <div class="flex flex-col gap-1">
          <span id="input-date-label" class="text-xs">
            Due date
          </span>
          <RLInputDate aria-labelledby="input-date-label" aria-describedby="input-date-hint" />
          <span id="input-date-hint" class="text-xs">
            Pick a day in 2026.
          </span>
        </div>
      ),
    },
    {
      id: "sizes",
      title: "Size variants",
      description: "Renders each size variant xs through xl.",
      render: () => (
        <div class="flex flex-col gap-2">
          <For each={SIZES}>{(s) => <RLInputDate size={s} aria-label={`Size ${s}`} />}</For>
        </div>
      ),
    },
  ],
};
