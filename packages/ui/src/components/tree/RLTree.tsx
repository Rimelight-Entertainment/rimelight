import { For, Show, type Component } from "solid-js";
import type { RLTreeProps, TreeItem, TreeSlotContext } from "./tree.types";
import { RLTreeTheme } from "./tree.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";
import { createControllable } from "../../controllable";
import { renderSlot } from "../../slot";
import { uiT } from "../../locale";

const OMIT_KEYS = [
  "items",
  "value",
  "onValueChange",
  "expanded",
  "defaultExpanded",
  "onExpandedChange",
  "itemAttrs",
  "itemClass",
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
    if (!item.disabled) props.onValueChange?.(item.id);
  };

  const Node: Component<TreeSlotContext> = (node) => {
    const hasChildren = () => (node.item.children?.length ?? 0) > 0;
    const selected = () => props.value === node.item.id;
    return (
      <div class={classes().item} data-slot="item" role="none">
        <div
          class={[classes().row, props.itemClass?.(node.item, node.depth)]
            .filter(Boolean)
            .join(" ")}
          style={{ "--rl-tree-indent": `${node.depth * 12 + 4}px` }}
          data-slot="row"
          data-disabled={node.item.disabled ? "" : undefined}
          role="treeitem"
          aria-level={node.depth + 1}
          aria-selected={selected() ? "true" : "false"}
          aria-expanded={hasChildren() ? (isOpen(node.item.id) ? "true" : "false") : undefined}
          aria-disabled={node.item.disabled ? "true" : undefined}
          {...(props.itemAttrs?.(node.item, node.depth) ?? {})}
        >
          <RLButton
            variant="ghost"
            color="neutral"
            type="button"
            class={classes().toggle}
            data-slot="toggle"
            disabled={!hasChildren()}
            aria-label={isOpen(node.item.id) ? uiT("tree.collapse") : uiT("tree.expand")}
            onClick={() => toggle(node.item.id)}
          >
            <RLIcon
              name={isOpen(node.item.id) ? "chevron-down" : "chevron-right"}
              aria-hidden="true"
            />
          </RLButton>
          <Show
            when={slots.itemSlot()}
            fallback={
              <RLButton
                variant="ghost"
                color="neutral"
                type="button"
                class={classes().label}
                data-slot="label"
                disabled={node.item.disabled}
                onClick={() => select(node.item)}
              >
                <Show when={node.item.icon}>
                  {(icon) => (
                    <span class={classes().icon} data-slot="icon">
                      <RLIcon name={icon()} aria-hidden="true" />
                    </span>
                  )}
                </Show>
                <span class={classes().text} data-slot="text">
                  {node.item.label}
                </span>
              </RLButton>
            }
          >
            {renderSlot(slots.itemSlot(), { item: node.item, depth: node.depth })}
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
