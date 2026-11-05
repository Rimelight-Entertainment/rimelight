import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLCheckboxGroup } from "@rimelight/ui/components/checkbox-group/RLCheckboxGroup.tsx";
import type { ComponentAuditDefinition } from "./types";

const LAYOUTS = ["list", "card", "table"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const ORIENTATIONS = ["vertical", "horizontal"] as const;
const ITEMS = [
  { value: "alpha", label: "Alpha", description: "First option" },
  { value: "beta", label: "Beta", description: "Second option" },
  { value: "gamma", label: "Gamma", description: "Third option", disabled: true },
];

export const CheckboxGroupSandbox = (): JSX.Element => {
  const [layout, setLayout] = createSignal<(typeof LAYOUTS)[number]>("list");
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [orientation, setOrientation] = createSignal<(typeof ORIENTATIONS)[number]>("vertical");

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-2 text-xs">
        <span class="text-muted mr-1">layout</span>
        <For each={LAYOUTS}>
          {(l) => (
            <button
              type="button"
              onClick={() => setLayout(l)}
              class={`px-2 py-0.5 rounded text-xs font-mono ${
                layout() === l
                  ? "bg-primary text-inverted"
                  : "bg-elevated text-muted border border-default"
              }`}
            >
              {l}
            </button>
          )}
        </For>
        <span class="text-muted mx-1">size</span>
        <For each={SIZES}>
          {(s) => (
            <button
              type="button"
              onClick={() => setSize(s)}
              class={`px-2 py-0.5 rounded text-xs font-mono ${
                size() === s
                  ? "bg-primary text-inverted"
                  : "bg-elevated text-muted border border-default"
              }`}
            >
              {s}
            </button>
          )}
        </For>
        <span class="text-muted mx-1">orientation</span>
        <For each={ORIENTATIONS}>
          {(o) => (
            <button
              type="button"
              onClick={() => setOrientation(o)}
              class={`px-2 py-0.5 rounded text-xs font-mono ${
                orientation() === o
                  ? "bg-primary text-inverted"
                  : "bg-elevated text-muted border border-default"
              }`}
            >
              {o}
            </button>
          )}
        </For>
      </div>
      <RLCheckboxGroup
        legend="Options"
        items={ITEMS}
        layout={layout()}
        size={size()}
        orientation={orientation()}
        defaultValue={["alpha"]}
      />
    </div>
  );
};

export const checkboxGroupAudit: ComponentAuditDefinition = {
  id: "checkbox-group",
  name: "Checkbox Group",
  category: "Form & Input",
  status: "Auditing",
  description:
    "A fieldset of checkboxes driven by an items array with value/label/description keys, layouts (list, card, table), orientation, size, max selection, and legend, label, and description slots.",
  importPath: "@rimelight/ui/components/checkbox-group/RLCheckboxGroup.tsx",
  renderSandbox: () => <CheckboxGroupSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render when no items are passed.",
      render: () => (
        <RLCheckboxGroup legend="Custom">
          <span class="text-sm">Custom child content in place of items.</span>
        </RLCheckboxGroup>
      ),
    },
    {
      id: "legend-slot",
      title: "Legend slot",
      description: "Custom JSX rendered as the legend.",
      render: () => (
        <RLCheckboxGroup
          items={ITEMS}
          legendSlot={<span class="font-semibold">Custom legend</span>}
        />
      ),
    },
    {
      id: "label-slot",
      title: "Label slot",
      description: "Custom label content per item, receiving the item.",
      render: () => (
        <RLCheckboxGroup
          items={ITEMS}
          legend="Options"
          labelSlot={({ item }) => (
            <span class="font-mono">{String(item.label ?? item.value)}</span>
          )}
        />
      ),
    },
    {
      id: "description-slot",
      title: "Description slot",
      description: "Custom description content per item, receiving the item.",
      render: () => (
        <RLCheckboxGroup
          items={ITEMS}
          legend="Options"
          descriptionSlot={({ item }) => (
            <span class="italic">{String(item.description ?? "")}</span>
          )}
        />
      ),
    },
    {
      id: "layouts",
      title: "Layouts",
      description: "list, card, and table layouts.",
      render: () => (
        <div class="flex flex-col gap-6">
          <For each={LAYOUTS}>{(l) => <RLCheckboxGroup legend={l} items={ITEMS} layout={l} />}</For>
        </div>
      ),
    },
    {
      id: "orientation",
      title: "Orientation",
      description: "Vertical and horizontal orientation.",
      render: () => (
        <div class="flex flex-col gap-6">
          <RLCheckboxGroup legend="Vertical" items={ITEMS} orientation="vertical" />
          <RLCheckboxGroup legend="Horizontal" items={ITEMS} orientation="horizontal" />
        </div>
      ),
    },
    {
      id: "sizes",
      title: "Sizes",
      description: "Every size scale: xs, sm, md, lg, xl.",
      render: () => (
        <div class="flex flex-col gap-6">
          <For each={SIZES}>{(s) => <RLCheckboxGroup legend={s} items={ITEMS} size={s} />}</For>
        </div>
      ),
    },
    {
      id: "controlled-value",
      title: "Controlled value",
      description: "Selected values controlled through value and onValueChange.",
      render: () => {
        const [value, setValue] = createSignal<(string | number)[]>(["beta"]);
        return (
          <div class="flex flex-col gap-2">
            <RLCheckboxGroup
              legend="Controlled"
              items={ITEMS}
              value={value()}
              onValueChange={setValue}
            />
            <span class="text-xs text-muted">Selected: {value().join(", ") || "none"}</span>
          </div>
        );
      },
    },
    {
      id: "max-selection",
      title: "Max selection",
      description: "Limits how many items can be selected at once.",
      render: () => <RLCheckboxGroup legend="Max 1" items={ITEMS} max={1} />,
    },
    {
      id: "side-and-indicator",
      title: "Side and indicator",
      description: "Checkbox placed at the end side, and the indicator hidden.",
      render: () => (
        <div class="flex flex-col gap-6">
          <RLCheckboxGroup legend="Side end" items={ITEMS} side="end" />
          <RLCheckboxGroup legend="No indicator" items={ITEMS} hasIndicator={false} />
        </div>
      ),
    },
    {
      id: "color-highlight-disabled",
      title: "Color, highlight, disabled",
      description: "Color theme, highlighted state, and the whole group disabled.",
      render: () => (
        <div class="flex flex-col gap-6">
          <RLCheckboxGroup legend="Color" items={ITEMS} color="success" />
          <RLCheckboxGroup legend="Highlight" items={ITEMS} highlight />
          <RLCheckboxGroup legend="Disabled" items={ITEMS} disabled />
        </div>
      ),
    },
    {
      id: "required-name",
      title: "Required and name",
      description: "Form name and required marker on the group.",
      render: () => <RLCheckboxGroup legend="Required" items={ITEMS} name="choices" required />,
    },
  ],
};
