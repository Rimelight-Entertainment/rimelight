import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLInputMenu } from "@rimelight/ui/components/input-menu/RLInputMenu.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const stringItems = ["Apple", "Banana", "Cherry", "Grape"];
const objectItems = [
  { label: "Design", value: "design" },
  { label: "Engineering", value: "engineering" },
  { label: "Marketing", value: "marketing" },
];

export const InputMenuSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [disabled, setDisabled] = createSignal(false);
  const [value, setValue] = createSignal<string | undefined>("design");

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
        <button type="button" onClick={() => setValue(undefined)}>
          clear value
        </button>
      </div>
      <RLInputMenu
        label="Department"
        items={objectItems}
        value={value()}
        onValueChange={setValue}
        size={size()}
        disabled={disabled()}
        placeholder="Choose a department"
        name="department"
      />
      <span class="text-xs">value: {value() ?? "none"}</span>
    </div>
  );
};

export const inputMenuAudit: ComponentAuditDefinition = {
  id: "input-menu",
  name: "Input Menu",
  category: "Form & Input",
  status: "Auditing",
  description:
    "Select-style menu with a search field and a listbox of string or object items, supporting controlled and uncontrolled values and a hidden form input.",
  importPath: "@rimelight/ui/components/input-menu/RLInputMenu.tsx",
  renderSandbox: () => <InputMenuSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot children",
      description: "Children render below the menu. Passes a helper text node.",
      render: () => (
        <RLInputMenu label="Fruit" items={stringItems} aria-label="Fruit menu">
          <span class="text-xs">Helper text rendered as children</span>
        </RLInputMenu>
      ),
    },
    {
      id: "string-items",
      title: "String items",
      description: "Items supplied as plain strings.",
      render: () => (
        <RLInputMenu
          label="Fruit"
          items={stringItems}
          placeholder="Pick a fruit"
          aria-label="Fruit menu"
        />
      ),
    },
    {
      id: "object-items",
      title: "Object items (label and value)",
      description: "Items with separate label and value fields.",
      render: () => <RLInputMenu label="Team" items={objectItems} aria-label="Team menu" />,
    },
    {
      id: "default-value",
      title: "defaultValue (uncontrolled)",
      description: "Initial value without a controlled value prop.",
      render: () => (
        <RLInputMenu
          label="Team"
          items={objectItems}
          defaultValue="marketing"
          aria-label="Default team"
        />
      ),
    },
    {
      id: "controlled",
      title: "value with onValueChange",
      description: "Controlled value. onValueChange receives the selected value.",
      render: () => {
        const [value, setValue] = createSignal<string | undefined>("engineering");
        return (
          <div class="flex flex-col gap-2">
            <RLInputMenu
              label="Team"
              items={objectItems}
              value={value()}
              onValueChange={setValue}
              aria-label="Controlled team"
            />
            <span class="text-xs">{value() ?? "none"}</span>
          </div>
        );
      },
    },
    {
      id: "states",
      title: "disabled and name",
      description: "Disabled state and a form name for the hidden input.",
      render: () => (
        <RLInputMenu
          label="Locked"
          items={stringItems}
          disabled={true}
          name="locked"
          aria-label="Locked menu"
        />
      ),
    },
    {
      id: "aria-attributes",
      title: "aria-labelledby and aria-describedby",
      description: "Label and description IDs applied to the trigger.",
      render: () => (
        <div class="flex flex-col gap-1">
          <span id="input-menu-label" class="text-xs">
            Region
          </span>
          <RLInputMenu
            aria-labelledby="input-menu-label"
            aria-describedby="input-menu-hint"
            items={stringItems}
          />
          <span id="input-menu-hint" class="text-xs">
            Choose the closest region.
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
          <For each={SIZES}>
            {(s) => <RLInputMenu size={s} items={stringItems} aria-label={`Size ${s}`} />}
          </For>
        </div>
      ),
    },
  ],
};
