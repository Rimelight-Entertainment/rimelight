import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLRadioGroup } from "@rimelight/ui/components/radio-group/RLRadioGroup.tsx";
import type { ComponentAuditDefinition } from "./types";

const PLANS = [
  { value: "free", label: "Free", description: "For personal projects." },
  { value: "pro", label: "Pro", description: "For teams and production workloads." },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Custom contracts and support.",
    disabled: true,
  },
];

export const RadioGroupSandbox = (): JSX.Element => {
  const [value, setValue] = createSignal<string | null>("pro");
  const [orientation, setOrientation] = createSignal<"horizontal" | "vertical">("vertical");
  const [disabled, setDisabled] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={orientation() === "horizontal"}
            onChange={(e) => setOrientation(e.currentTarget.checked ? "horizontal" : "vertical")}
          />
          Horizontal
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={disabled()}
            onChange={(e) => setDisabled(e.currentTarget.checked)}
          />
          Disabled
        </label>
        <span class="font-mono">value: {value() ?? "none"}</span>
      </div>
      <div class="p-8 rounded-xl border border-default bg-elevated/10">
        <RLRadioGroup
          items={PLANS}
          value={value()}
          onValueChange={setValue}
          orientation={orientation()}
          disabled={disabled()}
          aria-label="Plan"
        />
      </div>
    </div>
  );
};

export const radioGroupAudit: ComponentAuditDefinition = {
  id: "radio-group",
  name: "Radio Group",
  category: "Form & Input",
  status: "Auditing",
  description:
    "A set of mutually exclusive options built on native radio inputs, with item labels and descriptions, orientation, and per-item disabled state.",
  importPath: "@rimelight/ui/components/radio-group/RLRadioGroup.tsx",
  renderSandbox: () => <RadioGroupSandbox />,
  testScenarios: [
    {
      id: "label-slot",
      title: "Label slot",
      description: "Item labels rendered in the label slot.",
      render: () => (
        <RLRadioGroup
          items={[
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
          defaultValue="a"
          aria-label="Labels"
        />
      ),
    },
    {
      id: "description-slot",
      title: "Description slot",
      description: "Each item shows a label and description in the body slot.",
      render: () => <RLRadioGroup items={PLANS} defaultValue="free" aria-label="Descriptions" />,
    },
    {
      id: "horizontal",
      title: "Horizontal",
      description: "Items laid out on one row.",
      render: () => (
        <RLRadioGroup
          items={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
          orientation="horizontal"
          defaultValue="md"
          aria-label="Size"
        />
      ),
    },
    {
      id: "disabled-item",
      title: "Disabled item",
      description: "One item is disabled and cannot be selected.",
      render: () => <RLRadioGroup items={PLANS} defaultValue="pro" aria-label="Disabled item" />,
    },
  ],
  checklist: [
    { criterion: "Arrow keys move selection within the group", status: "pending" },
    { criterion: "Disabled items are skipped", status: "pending" },
    { criterion: "Group name is unique when not provided", status: "pending" },
  ],
};
