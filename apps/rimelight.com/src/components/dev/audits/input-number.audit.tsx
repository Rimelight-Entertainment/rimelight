import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLInputNumber } from "@rimelight/ui/components/input-number/RLInputNumber.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export const InputNumberSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [min, setMin] = createSignal<number | undefined>(0);
  const [max, setMax] = createSignal<number | undefined>(10);
  const [step, setStep] = createSignal<number | undefined>(1);
  const [disabled, setDisabled] = createSignal(false);
  const [readonly, setReadonly] = createSignal(false);
  const [value, setValue] = createSignal<number | undefined>(5);

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
        <button type="button" onClick={() => setMin((v) => (v === undefined ? 0 : undefined))}>
          min: {String(min())}
        </button>
        <button type="button" onClick={() => setMax((v) => (v === undefined ? 10 : undefined))}>
          max: {String(max())}
        </button>
        <button type="button" onClick={() => setStep((v) => (v === 1 ? 0.5 : 1))}>
          step: {String(step())}
        </button>
        <button type="button" onClick={() => setDisabled((v) => !v)}>
          disabled: {String(disabled())}
        </button>
        <button type="button" onClick={() => setReadonly((v) => !v)}>
          readonly: {String(readonly())}
        </button>
      </div>
      <RLInputNumber
        size={size()}
        value={value()}
        onValueChange={setValue}
        min={min()}
        max={max()}
        step={step()}
        disabled={disabled()}
        readonly={readonly()}
        aria-label="Quantity"
      />
      <span class="text-xs">value: {value() ?? "empty"}</span>
    </div>
  );
};

export const inputNumberAudit: ComponentAuditDefinition = {
  id: "input-number",
  name: "Input Number",
  category: "Form & Input",
  status: "Auditing",
  description:
    "Numeric input with increment and decrement buttons, min and max clamping, step, arrow key and mouse wheel stepping, and controlled or uncontrolled values.",
  importPath: "@rimelight/ui/components/input-number/RLInputNumber.tsx",
  renderSandbox: () => <InputNumberSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot children",
      description: "Children render after the input. Passes a helper text node.",
      render: () => (
        <RLInputNumber aria-label="Quantity">
          <span class="text-xs">Helper text rendered as children</span>
        </RLInputNumber>
      ),
    },
    {
      id: "uncontrolled",
      title: "defaultValue (uncontrolled)",
      description: "Initial value without a controlled value prop.",
      render: () => <RLInputNumber defaultValue={3} aria-label="Default quantity" />,
    },
    {
      id: "controlled",
      title: "value with onValueChange",
      description: "Controlled value. onValueChange receives the clamped number.",
      render: () => {
        const [value, setValue] = createSignal<number | undefined>(1);
        return (
          <div class="flex flex-col gap-2">
            <RLInputNumber
              value={value()}
              onValueChange={setValue}
              aria-label="Controlled quantity"
            />
            <span class="text-xs">{value() ?? "empty"}</span>
          </div>
        );
      },
    },
    {
      id: "min-max",
      title: "min and max clamping",
      description: "Values outside min and max are clamped.",
      render: () => (
        <RLInputNumber min={1} max={5} defaultValue={3} aria-label="Bounded quantity" />
      ),
    },
    {
      id: "step",
      title: "step prop",
      description: "Stepper buttons, arrow keys, and wheel move by 0.5.",
      render: () => <RLInputNumber step={0.5} defaultValue={1} aria-label="Half steps" />,
    },
    {
      id: "states",
      title: "disabled, readonly, required",
      description: "Each state flag on its own input.",
      render: () => (
        <div class="flex flex-col gap-2">
          <RLInputNumber disabled={true} defaultValue={2} aria-label="Disabled number" />
          <RLInputNumber readonly={true} defaultValue={2} aria-label="Readonly number" />
          <RLInputNumber required={true} placeholder="Required" aria-label="Required number" />
        </div>
      ),
    },
    {
      id: "form-attributes",
      title: "name and placeholder",
      description: "Form name and placeholder text.",
      render: () => <RLInputNumber name="count" placeholder="0" aria-label="Count" />,
    },
    {
      id: "aria-attributes",
      title: "aria-labelledby and aria-describedby",
      description: "Label and description IDs applied to the input.",
      render: () => (
        <div class="flex flex-col gap-1">
          <span id="input-number-label" class="text-xs">
            Seats
          </span>
          <RLInputNumber
            aria-labelledby="input-number-label"
            aria-describedby="input-number-hint"
          />
          <span id="input-number-hint" class="text-xs">
            Between 1 and 8.
          </span>
        </div>
      ),
    },
    {
      id: "event-handlers",
      title: "Native event handlers",
      description: "onInput, onFocus, onBlur, onKeyDown are attached and log the event type.",
      render: () => (
        <RLInputNumber
          aria-label="Events"
          onInput={(e) => console.info("input", e.currentTarget.value)}
          onFocus={() => console.info("focus")}
          onBlur={() => console.info("blur")}
          onKeyDown={(e) => console.info("keydown", e.key)}
        />
      ),
    },
    {
      id: "sizes",
      title: "Size variants",
      description: "Renders each size variant xs through xl.",
      render: () => (
        <div class="flex flex-col gap-2">
          <For each={SIZES}>{(s) => <RLInputNumber size={s} aria-label={`Size ${s}`} />}</For>
        </div>
      ),
    },
  ],
};
