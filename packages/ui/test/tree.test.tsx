import { describe, expect, it } from "vite-plus/test";
import { RLTree } from "../src/components/tree/RLTree";
import type { TreeItem } from "../src/components/tree/tree.types";
import { mountComponent } from "./utils/browser-render";

const items: TreeItem[] = [
  {
    id: "docs",
    label: "Docs",
    icon: "lucide:folder",
    children: [{ id: "intro", label: "Intro" }],
  },
  { id: "locked", label: "Locked", disabled: true },
];

const rowFor = (container: HTMLElement, label: string) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-slot="row"]')).find(
    (row) => row.querySelector('[data-slot="text"]')?.textContent === label,
  );

describe("RLTree", () => {
  it("renders the root with the tree role and one treeitem per visible node", () => {
    const container = mountComponent(() => <RLTree items={items} />);
    const root = container.querySelector<HTMLElement>('[data-slot="root"]');

    expect(root?.getAttribute("role")).toBe("tree");
    expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(2);
    expect(rowFor(container, "Docs")?.getAttribute("aria-level")).toBe("1");
  });

  it("marks the row whose id matches value as selected", () => {
    const container = mountComponent(() => <RLTree items={items} value="docs" />);

    expect(rowFor(container, "Docs")?.getAttribute("aria-selected")).toBe("true");
    expect(rowFor(container, "Locked")?.getAttribute("aria-selected")).toBe("false");
  });

  it("hides children until the node is expanded", () => {
    const container = mountComponent(() => <RLTree items={items} />);

    expect(container.querySelector('[data-slot="children"]')).toBeNull();
    expect(rowFor(container, "Docs")?.getAttribute("aria-expanded")).toBe("false");
  });

  it("starts expanded from defaultExpanded and shows the children", () => {
    const container = mountComponent(() => <RLTree items={items} defaultExpanded={["docs"]} />);

    expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(3);
    expect(rowFor(container, "Intro")?.getAttribute("aria-level")).toBe("2");
    expect(rowFor(container, "Docs")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("disables the toggle for leaf nodes", () => {
    const container = mountComponent(() => <RLTree items={items} />);
    const leafToggle = rowFor(container, "Locked")?.querySelector<HTMLButtonElement>(
      '[data-slot="toggle"]',
    );

    expect(leafToggle?.disabled).toBe(true);
  });

  it("renders itemSlot with the node and its depth instead of the default label", () => {
    const container = mountComponent(() => (
      <RLTree
        items={items}
        defaultExpanded={["docs"]}
        itemSlot={({ item, depth }) => (
          <span data-testid="custom-row">
            {item.label}:{depth}
          </span>
        )}
      />
    ));

    const custom = Array.from(container.querySelectorAll('[data-testid="custom-row"]')).map(
      (node) => node.textContent,
    );

    expect(custom).toEqual(["Docs:0", "Intro:1", "Locked:0"]);
    expect(container.querySelector('[data-slot="label"]')).toBeNull();
  });

  it("applies itemClass and itemAttrs to each row", () => {
    const container = mountComponent(() => (
      <RLTree
        items={items}
        itemClass={(item) => (item.id === "docs" ? "marked" : undefined)}
        itemAttrs={(item) => ({ "data-id": item.id })}
      />
    ));

    expect(rowFor(container, "Docs")?.classList.contains("marked")).toBe(true);
    expect(rowFor(container, "Locked")?.classList.contains("marked")).toBe(false);
    expect(rowFor(container, "Locked")?.getAttribute("data-id")).toBe("locked");
  });
});
