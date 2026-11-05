import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLInputTags } from "@rimelight/ui/components/input-tags/RLInputTags.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition, type TestScenario } from "./types";

const ITEMS = ["react", "solid", "vite", "typescript", "tailwind", "vitest"];

const InputTagsSandbox = (): JSX.Element => {
  const [displayLimit, setDisplayLimit] = createSignal(4);
  const [showInput, setShowInput] = createSignal(true);
  const [color, setColor] = createSignal<string>("primary");
  const [added, setAdded] = createSignal<string[]>([]);

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <button type="button" onClick={() => setDisplayLimit(2)}>
          displayLimit: 2
        </button>
        <button type="button" onClick={() => setDisplayLimit(4)}>
          displayLimit: 4
        </button>
        <button type="button" onClick={() => setShowInput((v) => !v)}>
          hasInput: {showInput() ? "on" : "off"}
        </button>
        <For each={AUDIT_COLORS}>
          {(c) => (
            <button type="button" onClick={() => setColor(c)}>
              color: {c}
            </button>
          )}
        </For>
        <span>last added: {added().at(-1) ?? "none"}</span>
      </div>
      <RLInputTags
        items={ITEMS}
        displayLimit={displayLimit()}
        hasInput={showInput()}
        color={color()}
        placeholder="Add a tag and press Enter"
        onAddTag={(tag) => setAdded((prev) => [...prev, String(tag)])}
      />
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default-slot",
    title: "Default slot (children, no items)",
    description: "Children render in place of the tag list when there are no items.",
    render: () => (
      <RLInputTags>
        <span>No tags yet</span>
      </RLInputTags>
    ),
  },
  {
    id: "items-string-and-object",
    title: "items (string and object)",
    description: "Items accept strings or { label, value } objects.",
    render: () => (
      <RLInputTags
        items={["plain string", { label: "Object label", value: "object-value" }]}
        hasInput={false}
      />
    ),
  },
  {
    id: "display-limit",
    title: "displayLimit (overflow count)",
    description: "Items beyond displayLimit collapse into a more indicator. Default is 4.",
    render: () => <RLInputTags items={ITEMS} displayLimit={2} hasInput={false} />,
  },
  {
    id: "input",
    title: "Input field",
    description:
      "hasInput shows the text input. Enter calls onAddTag with the entered tag. name and placeholder apply to the input.",
    render: () => (
      <RLInputTags
        name="audit-tags"
        placeholder="Type and press Enter"
        onAddTag={(tag) => console.info("onAddTag", tag)}
      />
    ),
  },
  {
    id: "colors",
    title: "Color (auto palette)",
    description: "Color is a palette key; default is primary.",
    render: () => (
      <div class="flex flex-col gap-3">
        <For each={AUDIT_COLORS}>
          {(c) => <RLInputTags items={ITEMS.slice(0, 3)} color={c} hasInput={false} />}
        </For>
      </div>
    ),
  },
];

export const inputTagsAudit: ComponentAuditDefinition = {
  id: "input-tags",
  name: "Input Tags",
  category: "Form & Input",
  status: "Auditing",
  description: "Tag input with a display limit, optional text input, and an add-tag callback.",
  importPath: "@rimelight/ui/components/input-tags/RLInputTags.tsx",
  renderSandbox: () => <InputTagsSandbox />,
  testScenarios,
};
