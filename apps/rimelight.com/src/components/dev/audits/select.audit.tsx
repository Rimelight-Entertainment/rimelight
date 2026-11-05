import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const VARIANTS = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;
const LAYOUTS = ["default", "icon"] as const;
const ITEMS = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
];

export const SelectSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("outline");
  const [layout, setLayout] = createSignal<(typeof LAYOUTS)[number]>("default");
  const [color, setColor] = createSignal<string>("primary");
  const [disabled, setDisabled] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-muted">Size:</span>
          <For each={SIZES}>
            {(s) => (
              <button
                type="button"
                onClick={() => setSize(s)}
                class={`px-2 py-1 rounded-md transition-colors ${
                  size() === s
                    ? "bg-primary text-inverted"
                    : "bg-elevated text-muted hover:text-default border border-default"
                }`}
              >
                {s}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">Variant:</span>
          <For each={VARIANTS}>
            {(v) => (
              <button
                type="button"
                onClick={() => setVariant(v)}
                class={`px-2 py-1 rounded-md transition-colors ${
                  variant() === v
                    ? "bg-primary text-inverted"
                    : "bg-elevated text-muted hover:text-default border border-default"
                }`}
              >
                {v}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">Layout:</span>
          <For each={LAYOUTS}>
            {(l) => (
              <button
                type="button"
                onClick={() => setLayout(l)}
                class={`px-2 py-1 rounded-md transition-colors ${
                  layout() === l
                    ? "bg-primary text-inverted"
                    : "bg-elevated text-muted hover:text-default border border-default"
                }`}
              >
                {l}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">Color:</span>
          <For each={AUDIT_COLORS}>
            {(c) => (
              <button
                type="button"
                onClick={() => setColor(c)}
                class={`px-2 py-1 rounded-md transition-colors ${
                  color() === c
                    ? "bg-primary text-inverted"
                    : "bg-elevated text-muted hover:text-default border border-default"
                }`}
              >
                {c}
              </button>
            )}
          </For>
        </div>
        <button
          type="button"
          onClick={() => setDisabled((v) => !v)}
          class={`px-2 py-1 rounded-md transition-colors ${
            disabled()
              ? "bg-primary text-inverted"
              : "bg-elevated text-muted hover:text-default border border-default"
          }`}
        >
          disabled
        </button>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        <RLSelect
          items={ITEMS}
          placeholder="Pick a fruit"
          size={size()}
          variant={variant()}
          layout={layout()}
          color={color()}
          disabled={disabled()}
        />
      </div>
    </div>
  );
};

export const selectAudit: ComponentAuditDefinition = {
  id: "select",
  name: "Select",
  category: "Form & Input",
  status: "Auditing",
  description:
    "A native single or multiple select with a styled trigger, optional leading icon or slot, and options from items or children.",
  importPath: "@rimelight/ui/components/select/RLSelect.tsx",
  renderSandbox: () => <SelectSandbox />,
  testScenarios: [
    {
      id: "default-items",
      title: "Default items",
      description: "Options built from the items array with a placeholder.",
      render: () => <RLSelect items={ITEMS} placeholder="Pick a fruit" />,
    },
    {
      id: "string-items",
      title: "String items",
      description: "Items given as plain strings. Each string is used as both label and value.",
      render: () => <RLSelect items={["Red", "Green", "Blue"]} placeholder="Pick a color" />,
    },
    {
      id: "disabled-item",
      title: "Disabled item",
      description: "One option is disabled and cannot be picked.",
      render: () => (
        <RLSelect
          items={[
            { label: "Available", value: "a" },
            { label: "Unavailable", value: "b", disabled: true },
          ]}
        />
      ),
    },
    {
      id: "default-value",
      title: "defaultValue",
      description: "Starts with Banana selected.",
      render: () => <RLSelect items={ITEMS} defaultValue="banana" />,
    },
    {
      id: "controlled-value",
      title: "Controlled value",
      description: "value is set to Cherry. Changing the value requires the onChange handler.",
      render: () => <RLSelect items={ITEMS} value="cherry" onChange={() => {}} />,
    },
    {
      id: "multiple",
      title: "multiple",
      description: "Multiple selection with an array value.",
      render: () => <RLSelect items={ITEMS} multiple defaultValue={["apple", "cherry"]} />,
    },
    {
      id: "name-required",
      title: "name, required, and disabled",
      description: "Form attributes: name for submission, required, and disabled state.",
      render: () => (
        <RLSelect items={ITEMS} name="fruit" required disabled placeholder="Disabled" />
      ),
    },
    {
      id: "leading-icon",
      title: "leadingIcon",
      description: "Icon rendered in the leading position of the trigger.",
      render: () => <RLSelect items={ITEMS} leadingIcon="lucide:apple" />,
    },
    {
      id: "leading-slot",
      title: "leadingSlot",
      description: "Custom JSX rendered in the leading position of the trigger.",
      render: () => (
        <RLSelect items={ITEMS} leadingSlot={() => <span class="font-semibold">Fruit</span>} />
      ),
    },
    {
      id: "layout-icon",
      title: "layout icon",
      description: "Compact icon-only layout.",
      render: () => <RLSelect items={ITEMS} layout="icon" leadingIcon="lucide:apple" />,
    },
    {
      id: "default-slot",
      title: "Default slot (children options)",
      description: "Children replace the generated option list.",
      render: () => (
        <RLSelect placeholder="Children options">
          <option value="x">Option X</option>
          <option value="y">Option Y</option>
        </RLSelect>
      ),
    },
    {
      id: "variants",
      title: "Variants",
      description: "Every variant value.",
      render: () => (
        <div class="flex flex-wrap gap-4 items-center">
          <For each={VARIANTS}>{(v) => <RLSelect items={ITEMS} variant={v} />}</For>
        </div>
      ),
    },
    {
      id: "sizes",
      title: "Sizes",
      description: "Every size value from xs to xl.",
      render: () => (
        <div class="flex flex-wrap gap-4 items-center">
          <For each={SIZES}>{(s) => <RLSelect items={ITEMS} size={s} />}</For>
        </div>
      ),
    },
    {
      id: "colors",
      title: "Colors",
      description: "Every color from the audit palette.",
      render: () => (
        <div class="flex flex-wrap gap-4 items-center">
          <For each={AUDIT_COLORS}>{(c) => <RLSelect items={ITEMS} color={c} />}</For>
        </div>
      ),
    },
  ],
};
