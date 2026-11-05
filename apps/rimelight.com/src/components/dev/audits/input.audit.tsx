import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const TYPES = [
  "text",
  "password",
  "email",
  "number",
  "date",
  "datetime-local",
  "search",
  "tel",
  "url",
] as const;

export const InputSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [type, setType] = createSignal<(typeof TYPES)[number]>("text");
  const [invalid, setInvalid] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [readonly, setReadonly] = createSignal(false);
  const [ghost, setGhost] = createSignal(false);
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
        <button type="button" onClick={() => setInvalid((v) => !v)}>
          invalid: {String(invalid())}
        </button>
        <button type="button" onClick={() => setDisabled((v) => !v)}>
          disabled: {String(disabled())}
        </button>
        <button type="button" onClick={() => setReadonly((v) => !v)}>
          readonly: {String(readonly())}
        </button>
        <button type="button" onClick={() => setGhost((v) => !v)}>
          variant ghost: {String(ghost())}
        </button>
      </div>
      <RLInput
        size={size()}
        type={type()}
        value={value()}
        onInput={(e) => setValue(e.currentTarget.value)}
        placeholder="Type here"
        invalid={invalid()}
        disabled={disabled()}
        readonly={readonly()}
        variant={ghost() ? "ghost" : undefined}
        leadingIcon="search"
      />
      <span class="text-xs">value: {value()}</span>
    </div>
  );
};

export const inputAudit: ComponentAuditDefinition = {
  id: "input",
  name: "Input",
  category: "Form & Input",
  status: "Auditing",
  description:
    "Text-style input with leading and trailing icons or slots, a ghost variant, sizes, invalid and disabled states, and native input event handlers.",
  importPath: "@rimelight/ui/components/input/RLInput.tsx",
  renderSandbox: () => <InputSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot children",
      description: "The input renders children after its field. Passes a helper text node.",
      render: () => (
        <RLInput placeholder="Default slot">
          <span class="text-xs">Helper text rendered as children</span>
        </RLInput>
      ),
    },
    {
      id: "leading-slot",
      title: "leadingSlot slot",
      description: "Passes a custom leading element. Replaces leadingIcon when present.",
      render: () => (
        <RLInput placeholder="Leading slot" leadingSlot={<span class="px-2">@</span>} />
      ),
    },
    {
      id: "trailing-slot",
      title: "trailingSlot slot",
      description: "Passes a custom trailing element. Replaces trailingIcon when present.",
      render: () => (
        <RLInput placeholder="Trailing slot" trailingSlot={<span class="px-2">USD</span>} />
      ),
    },
    {
      id: "icons",
      title: "leadingIcon and trailingIcon props",
      description: "Icon names on both sides of the field.",
      render: () => <RLInput placeholder="Search" leadingIcon="search" trailingIcon="x" />,
    },
    {
      id: "types",
      title: "type prop values",
      description: "Renders each native input type value.",
      render: () => (
        <div class="flex flex-col gap-2">
          <For each={TYPES}>{(t) => <RLInput type={t} placeholder={t} />}</For>
        </div>
      ),
    },
    {
      id: "sizes",
      title: "Size variants",
      description: "Renders each size variant xs through xl.",
      render: () => (
        <div class="flex flex-col gap-2">
          <For each={SIZES}>{(s) => <RLInput size={s} placeholder={`Size ${s}`} />}</For>
        </div>
      ),
    },
    {
      id: "ghost-variant",
      title: "Ghost variant",
      description: "variant ghost removes the default surface styling.",
      render: () => <RLInput variant="ghost" placeholder="Ghost" />,
    },
    {
      id: "states",
      title: "invalid, disabled, readonly, required",
      description: "Each state flag on its own input.",
      render: () => (
        <div class="flex flex-col gap-2">
          <RLInput invalid={true} placeholder="Invalid" aria-label="Invalid input" />
          <RLInput disabled={true} placeholder="Disabled" aria-label="Disabled input" />
          <RLInput readonly={true} value="Readonly value" aria-label="Readonly input" />
          <RLInput required={true} placeholder="Required" aria-label="Required input" />
        </div>
      ),
    },
    {
      id: "form-attributes",
      title: "name, autocomplete, value",
      description: "Form and autofill attributes with a controlled value.",
      render: () => (
        <RLInput name="email" autocomplete="email" value="ada@example.com" aria-label="Email" />
      ),
    },
    {
      id: "event-handlers",
      title: "Native event handlers",
      description:
        "onInput, onChange, onFocus, onBlur, onKeyDown are attached and log the event type.",
      render: () => (
        <RLInput
          placeholder="Events"
          onInput={(e) => console.info("input", e.currentTarget.value)}
          onChange={(e) => console.info("change", e.currentTarget.value)}
          onFocus={() => console.info("focus")}
          onBlur={() => console.info("blur")}
          onKeyDown={(e) => console.info("keydown", e.key)}
        />
      ),
    },
  ],
};
