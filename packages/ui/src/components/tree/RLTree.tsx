import { For, Show, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { RLTreeProps, TreeItem } from "./tree.types";
import { RLTreeTheme } from "./tree.theme";
import { RLIcon } from "../icon/RLIcon";
import { createControllable } from "../../controllable";

const OMIT_KEYS = [
  "items",
  "selected",
  "onSelect",
  "expanded",
  "defaultExpanded",
  "onExpandedChange",
  "itemAttrs",
  "itemClass",
  "itemSlot",
] as const;

export const RLTree: Component<RLTreeProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLTreeTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["itemSlot"] as const,
  });
  const [expanded, setExpanded] = createControllable<string[]>(
    () => props.expanded,
    props.defaultExpanded ?? [],
    (next) => props.onExpandedChange?.(next),
  );
  const isOpen = (id: string) => expanded().includes(id);
  const toggle = (id: string) =>
    setExpanded(isOpen(id) ? expanded().filter((x) => x !== id) : [...expanded(), id]);
  const select = (item: TreeItem) => {
    if (!item.disabled) props.onSelect?.(item);
  };

  const Node: Component<{ item: TreeItem; depth: number }> = (node) => {
    const hasChildren = () => (node.item.children?.length ?? 0) > 0;
    const selected = () => props.selected === node.item.id;
    const rowAttrs = () => props.itemAttrs?.(node.item, node.depth) ?? {};
    const extraClass = () => props.itemClass?.(node.item, node.depth) ?? "";
    return (
      <div class={classes().item} data-slot="item" role="none">
        <div
          class={`${classes().row} ${extraClass()}`}
          style={{ "--rl-tree-indent": `${node.depth * 12 + 4}px` }}
          data-slot="row"
          data-selected={selected() ? "true" : "false"}
          data-disabled={node.item.disabled ? "true" : "false"}
          role="treeitem"
          aria-level={node.depth + 1}
          aria-selected={selected() ? "true" : "false"}
          aria-expanded={hasChildren() ? (isOpen(node.item.id) ? "true" : "false") : undefined}
          aria-disabled={node.item.disabled ? "true" : undefined}
          {...rowAttrs()}
        >
          <button
            type="button"
            class={classes().toggle}
            data-slot="toggle"
            disabled={!hasChildren()}
            aria-label={isOpen(node.item.id) ? "Collapse" : "Expand"}
            onClick={() => toggle(node.item.id)}
          >
            <RLIcon
              name={isOpen(node.item.id) ? "chevron-down" : "chevron-right"}
              aria-hidden="true"
            />
          </button>
          <Show
            when={slots.itemSlot()}
            fallback={
              <button
                type="button"
                class={classes().label}
                data-slot="label"
                disabled={node.item.disabled}
                onClick={() => select(node.item)}
              >
                <Show when={node.item.icon}>
                  <span
                    class={classes().icon}
                    data-slot="icon"
                    data-selected={selected() ? "true" : "false"}
                  >
                    <RLIcon name={node.item.icon!} aria-hidden="true" />
                  </span>
                </Show>
                <span class="truncate">{node.item.label}</span>
              </button>
            }
          >
            {(slots.itemSlot() as ((item: TreeItem, depth: number) => JSX.Element) | undefined)?.(
              node.item,
              node.depth,
            )}
          </Show>
        </div>
        <Show when={hasChildren() && isOpen(node.item.id)}>
          <div class={classes().children} data-slot="children" role="group">
            <For each={node.item.children}>
              {(child) => <Node item={child} depth={node.depth + 1} />}
            </For>
          </div>
        </Show>
      </div>
    );
  };

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} role="tree" {...rest}>
      <For each={props.items ?? []}>{(item) => <Node item={item} depth={0} />}</For>
      {children()}
    </Tag>
  );
};
