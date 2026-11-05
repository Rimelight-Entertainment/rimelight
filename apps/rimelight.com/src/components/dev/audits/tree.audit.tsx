import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLTree } from "@rimelight/ui/components/tree/RLTree.tsx";
import type { ComponentAuditDefinition } from "./types";

const SAMPLE = [
  {
    id: "src",
    label: "src",
    icon: "i-lucide-folder",
    children: [
      {
        id: "src/app",
        label: "app",
        icon: "i-lucide-folder",
        children: [{ id: "src/app/root", label: "root.tsx", icon: "i-lucide-file" }],
      },
      { id: "src/index", label: "index.ts", icon: "i-lucide-file" },
    ],
  },
  {
    id: "docs",
    label: "docs",
    icon: "i-lucide-book",
    children: [{ id: "docs/readme", label: "README.md", icon: "i-lucide-file" }],
  },
  { id: "secrets", label: "secrets.env", icon: "lock", disabled: true },
];

const SELECTABLE = ["src", "src/app/root", "src/index", "docs", "docs/readme"] as const;

export const TreeSandbox = (): JSX.Element => {
  const [value, setValue] = createSignal<string | undefined>("src/index");
  const [expanded, setExpanded] = createSignal<string[]>(["src", "src/app"]);
  const [lastSelected, setLastSelected] = createSignal("none");

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-3 text-xs">
        <span class="font-semibold text-muted">value:</span>
        <button
          type="button"
          class="px-2 py-1 rounded border border-default"
          onClick={() => setValue(undefined)}
        >
          none
        </button>
        <For each={SELECTABLE}>
          {(id) => (
            <button
              type="button"
              class={`px-2 py-1 rounded border border-default ${value() === id ? "bg-primary text-on-primary" : ""}`}
              onClick={() => setValue(id)}
            >
              {id}
            </button>
          )}
        </For>
        <span class="font-semibold text-muted">expanded:</span>
        <button
          type="button"
          class="px-2 py-1 rounded border border-default"
          onClick={() => setExpanded([])}
        >
          collapse all
        </button>
        <button
          type="button"
          class="px-2 py-1 rounded border border-default"
          onClick={() => setExpanded(["src", "src/app", "docs"])}
        >
          expand all
        </button>
        <span class="text-muted">last onValueChange: {lastSelected()}</span>
      </div>

      <RLTree
        items={SAMPLE}
        value={value()}
        onValueChange={(id) => {
          setValue(id);
          setLastSelected(id);
        }}
        expanded={expanded()}
        onExpandedChange={(next) => setExpanded(next)}
      />
    </div>
  );
};

export const treeAudit: ComponentAuditDefinition = {
  id: "tree",
  name: "Tree",
  category: "Data Display",
  status: "Auditing",
  description:
    "A hierarchical list of items with expandable nodes, selection by id, disabled nodes, and custom row rendering through itemSlot.",
  importPath: "@rimelight/ui/components/tree/RLTree.tsx",
  renderSandbox: () => <TreeSandbox />,
  testScenarios: [
    {
      id: "uncontrolled-expansion",
      title: "Uncontrolled expansion",
      description: "defaultExpanded opens the listed nodes; toggles update the state internally.",
      render: () => <RLTree items={SAMPLE} defaultExpanded={["src"]} />,
    },
    {
      id: "selection",
      title: "Selection by id",
      description:
        "value marks the matching row selected; clicking a label reports its id through onValueChange.",
      render: () => (
        <RLTree
          items={SAMPLE}
          value="docs/readme"
          onValueChange={() => {}}
          defaultExpanded={["docs"]}
        />
      ),
    },
    {
      id: "disabled",
      title: "Disabled node",
      description:
        "Disabled rows show data-disabled, cannot be selected, and have no toggle when they have no children.",
      render: () => <RLTree items={SAMPLE} defaultExpanded={["src"]} value="secrets" />,
    },
    {
      id: "item-class-and-attrs",
      title: "itemClass and itemAttrs",
      description: "Per-row class and attributes receive the node and its depth.",
      render: () => (
        <RLTree
          items={SAMPLE}
          defaultExpanded={["src", "src/app"]}
          itemClass={(_item, depth) => (depth > 0 ? "opacity-80" : undefined)}
          itemAttrs={(item, depth) => ({ "data-depth": String(depth), "data-id": item.id })}
        />
      ),
    },
    {
      id: "item-slot",
      title: "itemSlot",
      description:
        "Render-function slot that replaces the default row label. Receives the node and depth.",
      render: () => (
        <RLTree
          items={SAMPLE}
          defaultExpanded={["src"]}
          itemSlot={({ item, depth }) => (
            <span class="flex items-center gap-2 px-2 py-1 text-sm">
              <span class="text-muted">{"-".repeat(depth)}</span>
              <span class="font-semibold">{item.label}</span>
            </span>
          )}
        />
      ),
    },
    {
      id: "children",
      title: "Default slot (children)",
      description: "Children render after the item list inside the tree root.",
      render: () => (
        <RLTree items={SAMPLE} defaultExpanded={["docs"]}>
          <p class="px-2 pt-2 text-xs text-muted">Footer content rendered after the items.</p>
        </RLTree>
      ),
    },
    {
      id: "empty",
      title: "Empty tree",
      description: "No items renders the root with no rows.",
      render: () => <RLTree items={[]} />,
    },
  ],
  checklist: [
    {
      criterion: "Tree role and treeitem semantics",
      status: "pending",
      notes:
        "Root has role tree; rows have role treeitem with aria-level, aria-selected, and aria-expanded.",
    },
    {
      criterion: "Controlled selection and expansion",
      status: "pending",
      notes:
        "value, onValueChange, expanded, and onExpandedChange are the only source of truth when provided.",
    },
    {
      criterion: "Slot parity (itemSlot, children)",
      status: "pending",
      notes: "itemSlot replaces the default row label; children render after the items.",
    },
  ],
};
