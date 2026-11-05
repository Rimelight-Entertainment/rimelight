import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLInputPin } from "@rimelight/ui/components/input-pin/RLInputPin.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const TYPES = ["text", "numeric", "alphanumeric"] as const;

export const InputPinSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [type, setType] = createSignal<(typeof TYPES)[number]>("numeric");
  const [length, setLength] = createSignal(6);
  const [disabled, setDisabled] = createSignal(false);
  const [value, setValue] = createSignal("");

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
        <For each={TYPES}>
          {(t) => (
            <button type="button" onClick={() => setType(t)}>
              type: {t}
            </button>
          )}
        </For>
        <button type="button" onClick={() => setLength((n) => (n === 6 ? 4 : 6))}>
          length: {length()}
        </button>
        <button type="button" onClick={() => setDisabled((v) => !v)}>
          disabled: {String(disabled())}
        </button>
      </div>
      <RLInputPin
        size={size()}
        type={type()}
        length={length()}
        value={value()}
        onValueChange={setValue}
        onComplete={(code) => console.info("complete", code)}
        disabled={disabled()}
        name="otp"
      />
      <span class="text-xs">value: {value() || "empty"}</span>
    </div>
  );
};

export const inputPinAudit: ComponentAuditDefinition = {
  id: "input-pin",
  name: "Input Pin",
  category: "Form & Input",
  status: "Auditing",
  description:
    "One-time code input split into one cell per digit or character, with auto-advance, backspace and arrow navigation, paste handling, and an onComplete callback.",
  importPath: "@rimelight/ui/components/input-pin/RLInputPin.tsx",
  renderSandbox: () => <InputPinSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot children",
      description: "Children render after the cell group. Passes a helper text node.",
      render: () => (
        <RLInputPin aria-label="Verification code">
          <span class="text-xs">Helper text rendered as children</span>
        </RLInputPin>
      ),
    },
    {
      id: "default-length",
      title: "Default length (4)",
      description: "No length prop, so four cells render.",
      render: () => <RLInputPin aria-label="Default code" />,
    },
    {
      id: "length-and-default-value",
      title: "length and defaultValue (uncontrolled)",
      description: "Six cells with an initial value.",
      render: () => <RLInputPin length={6} defaultValue="123" aria-label="Six digit code" />,
    },
    {
      id: "controlled",
      title: "value with onValueChange",
      description: "Controlled value. onValueChange receives the full code on each change.",
      render: () => {
        const [value, setValue] = createSignal("42");
        return (
          <div class="flex flex-col gap-2">
            <RLInputPin value={value()} onValueChange={setValue} aria-label="Controlled code" />
            <span class="text-xs">{value()}</span>
          </div>
        );
      },
    },
    {
      id: "type-variants",
      title: "type prop values",
      description: "numeric, alphanumeric, and text acceptance rules.",
      render: () => (
        <div class="flex flex-col gap-2">
          <For each={TYPES}>{(t) => <RLInputPin type={t} aria-label={`Type ${t}`} />}</For>
        </div>
      ),
    },
    {
      id: "onComplete",
      title: "onComplete callback",
      description: "Fires with the full code when every cell is filled.",
      render: () => (
        <RLInputPin
          length={4}
          onComplete={(code) => console.info("complete", code)}
          aria-label="Completing code"
        />
      ),
    },
    {
      id: "onInput-and-onKeyDown",
      title: "onInput and onKeyDown handlers",
      description: "Native input and keydown handlers called for each cell.",
      render: () => (
        <RLInputPin
          aria-label="Handlers"
          onInput={(e) => console.info("input", e.currentTarget.value)}
          onKeyDown={(e) => console.info("keydown", e.key)}
        />
      ),
    },
    {
      id: "states",
      title: "disabled and required",
      description: "Each state flag on its own group.",
      render: () => (
        <div class="flex flex-col gap-2">
          <RLInputPin disabled={true} defaultValue="12" aria-label="Disabled code" />
          <RLInputPin required={true} aria-label="Required code" />
        </div>
      ),
    },
    {
      id: "aria-attributes",
      title: "aria-labelledby and aria-describedby",
      description: "Label and description IDs applied to the cell group.",
      render: () => (
        <div class="flex flex-col gap-1">
          <span id="input-pin-label" class="text-xs">
            Authenticator code
          </span>
          <RLInputPin aria-labelledby="input-pin-label" aria-describedby="input-pin-hint" />
          <span id="input-pin-hint" class="text-xs">
            Enter the 4 digits from your app.
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
          <For each={SIZES}>{(s) => <RLInputPin size={s} aria-label={`Size ${s}`} />}</For>
        </div>
      ),
    },
  ],
};
