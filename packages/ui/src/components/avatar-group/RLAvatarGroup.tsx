import type { Component } from "solid-js";
import { children, For, Show } from "solid-js";
import type { RLAvatarGroupProps } from "./avatar-group.types";
import { RLAvatarGroupTheme } from "./avatar-group.theme";
import { RLAvatar } from "../avatar/RLAvatar";

const OMIT_KEYS = ["items", "max", "displayLimit"] as const;

export const RLAvatarGroup: Component<RLAvatarGroupProps> = (props) => {
  const {
    Tag: Root,
    classes,
    rest,
  } = RLAvatarGroupTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const maxCount = () => {
    if (props.max !== undefined) {
      const parsed = Number(props.max);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    if (props.displayLimit !== undefined) {
      return props.displayLimit;
    }
    return undefined;
  };

  const size = () => props.size ?? "md";
  const color = () => props.color ?? "neutral";

  // For props.items mode
  const normalizedItems = () => props.items ?? [];
  const renderedItems = () => {
    const limit = maxCount();
    return limit !== undefined ? normalizedItems().slice(0, limit) : normalizedItems();
  };
  const hiddenItemCount = () => {
    const limit = maxCount();
    if (limit === undefined) return 0;
    return Math.max(0, normalizedItems().length - limit);
  };

  // For children mode
  const resolvedChildren = children(() => props.children);
  const childArray = () => resolvedChildren.toArray();

  const visibleChildren = () => {
    const limit = maxCount();
    const arr = childArray();
    return limit !== undefined ? arr.slice(0, limit) : arr;
  };

  const hiddenChildCount = () => {
    const limit = maxCount();
    if (limit === undefined) return 0;
    return Math.max(0, childArray().length - limit);
  };

  return (
    <Root class={classes().root} data-slot="avatar-group" {...rest}>
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
                alt={item.alt ?? ""}
                icon={item.icon}
                text={item.text}
                fallback={item.fallback}
                initials={item.initials}
                size={size()}
                color={(item.color ?? color()) as any}
                chip={item.chip}
                loading={item.loading}
              />
            </span>
          )}
        </For>
      </Show>
    </Root>
  );
};
