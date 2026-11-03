import type { Component } from "solid-js";
import { children, For, Show } from "solid-js";
import type { RLAvatarGroupProps } from "./avatar-group.types";
import { RLAvatarGroupTheme } from "./avatar-group.theme";
import { RLAvatar } from "../avatar/RLAvatar";

const OMIT_KEYS = ["items", "max"] as const;

export const RLAvatarGroup: Component<RLAvatarGroupProps> = (props) => {
  const {
    Tag,
    classes,
    rest,
    children: childNodes,
    theme,
  } = RLAvatarGroupTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  // For props.items mode
  const normalizedItems = () => props.items ?? [];
  const renderedItems = () => {
    const limit = props.max;
    return limit !== undefined ? normalizedItems().slice(0, limit) : normalizedItems();
  };
  const hiddenItemCount = () => {
    const limit = props.max;
    if (limit === undefined) return 0;
    return Math.max(0, normalizedItems().length - limit);
  };

  // For children mode
  const resolvedChildren = children(childNodes);
  const childArray = () => resolvedChildren.toArray();

  const visibleChildren = () => {
    const limit = props.max;
    const arr = childArray();
    return limit !== undefined ? arr.slice(0, limit) : arr;
  };

  const hiddenChildCount = () => {
    const limit = props.max;
    if (limit === undefined) return 0;
    return Math.max(0, childArray().length - limit);
  };

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <Show
        when={normalizedItems().length > 0}
        fallback={
          <>
            <Show when={hiddenChildCount() > 0}>
              <span class={classes().more} aria-hidden="true" data-slot="more">
                +{hiddenChildCount()}
              </span>
            </Show>
            <For each={[...visibleChildren()].reverse()}>
              {(child) => (
                <span class={classes().base} data-slot="base">
                  {child}
                </span>
              )}
            </For>
          </>
        }
      >
        <Show when={hiddenItemCount() > 0}>
          <span class={classes().more} aria-hidden="true" data-slot="more">
            +{hiddenItemCount()}
          </span>
        </Show>
        <For each={[...renderedItems()].reverse()}>
          {(item) => (
            <span class={classes().base} data-slot="base">
              <RLAvatar
                src={item.src}
                alt={item.alt}
                icon={item.icon}
                text={item.text}
                size={props.size}
                color={item.color ?? props.color}
                chip={item.chip}
                loading={item.loading}
              />
            </span>
          )}
        </For>
      </Show>
    </Tag>
  );
};
