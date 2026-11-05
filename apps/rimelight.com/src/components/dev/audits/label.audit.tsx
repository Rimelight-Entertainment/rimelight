import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLLabel } from "@rimelight/ui/components/label/RLLabel.tsx";
import type { ComponentAuditDefinition, TestScenario } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const LabelSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");

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
      </div>
      <div class="flex flex-col gap-2 p-4 rounded-xl border border-default">
        <RLLabel size={size()} for="audit-label-input">
          Email address
        </RLLabel>
        <input id="audit-label-input" type="email" class="border rounded px-2 py-1" />
      </div>
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default-slot",
    title: "Default slot (children)",
    description: "Label text passed as children renders inside the label element.",
    render: () => <RLLabel>Display name</RLLabel>,
  },
  {
    id: "for-attribute",
    title: "for attribute",
    description: "The for prop associates the label with a control by id.",
    render: () => (
      <div class="flex flex-col gap-2">
        <RLLabel for="audit-label-for">Username</RLLabel>
        <input id="audit-label-for" class="border rounded px-2 py-1" />
      </div>
    ),
  },
  {
    id: "sizes",
    title: "Every size",
    description: "xs, sm, md (default), lg, and xl.",
    render: () => (
      <div class="flex flex-col gap-2">
        <For each={SIZES}>{(s) => <RLLabel size={s}>Label {s}</RLLabel>}</For>
      </div>
    ),
  },
];

export const labelAudit: ComponentAuditDefinition = {
  id: "label",
  name: "Label",
  category: "Form & Input",
  status: "Auditing",
  description: "Form label rendered as a label element with size variants.",
  importPath: "@rimelight/ui/components/label/RLLabel.tsx",
  renderSandbox: () => <LabelSandbox />,
  testScenarios,
};
