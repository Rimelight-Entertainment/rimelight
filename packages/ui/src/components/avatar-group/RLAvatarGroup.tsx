import { children, createMemo, omit, For, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";
import type { RLAvatarGroupProps } from "./avatar-group";
import { avatarGroupTheme } from "./avatar-group.theme";
import { RLAvatar } from "../avatar/RLAvatar";

export const RLAvatarGroup: Component<RLAvatarGroupProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "as",
    "items",
    "max",
    "displayLimit",
    "size",
    "color",
    "ui",
    "class",
    "children",
  );

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

  const resolvedClasses = createMemo(() =>
    avatarGroupTheme({
      size: size(),
      color: color(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const Root = dynamic(() => props.as ?? "div");

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
  const childArray = createMemo(() => {
    const ch = resolvedChildren();
    if (!ch) return [];
    return Array.isArray(ch) ? ch : [ch];
  });

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
    <Root class={resolvedClasses().root} data-slot="avatar-group" {...rest}>
      {normalizedItems().length > 0 ? (
        <>
          {hiddenItemCount() > 0 && (
            <span class={resolvedClasses().more} aria-hidden="true" data-slot="more">
              +{hiddenItemCount()}
            </span>
          )}
          <For each={[...renderedItems()].reverse()}>
            {(item) => (
              <span class={resolvedClasses().base} data-slot="base">
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
        </>
      ) : (
        <>
          {hiddenChildCount() > 0 && (
            <span class={resolvedClasses().more} aria-hidden="true" data-slot="more">
              +{hiddenChildCount()}
            </span>
          )}
          <For each={[...visibleChildren()].reverse()}>
            {(child) => (
              <span class={resolvedClasses().base} data-slot="base">
                {child}
              </span>
            )}
          </For>
        </>
      )}
    </Root>
  );
};
