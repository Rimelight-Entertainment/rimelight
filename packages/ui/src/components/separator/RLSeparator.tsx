import { createMemo, Show, type Component } from "solid-js";
import type { RLSeparatorProps } from "./separator.types";
import { RLSeparatorTheme } from "./separator.theme";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLIcon } from "../icon/RLIcon";
import { renderSlot } from "../../slot";

const OMIT_KEYS = ["decorative", "label", "icon", "avatar"] as const;

export const RLSeparator: Component<RLSeparatorProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLSeparatorTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["avatarSlot", "iconSlot"] as const,
  });

  const isDecorative = createMemo(() => props.decorative ?? true);
  const hasAvatarSlot = createMemo(() => slots.avatarSlot() !== undefined);
  const hasIconSlot = createMemo(() => slots.iconSlot() !== undefined);
  const hasContent = createMemo(() =>
    Boolean(
      props.label || props.icon || props.avatar || hasAvatarSlot() || hasIconSlot() || children(),
    ),
  );

  const avatarProps = createMemo(() => {
    if (hasAvatarSlot() || !props.avatar) return undefined;
    return typeof props.avatar === "string" ? { src: props.avatar } : props.avatar;
  });
  const iconName = createMemo(() => (hasIconSlot() ? undefined : props.icon));

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      role={isDecorative() ? "none" : "separator"}
      aria-orientation={isDecorative() ? undefined : (props.orientation ?? "horizontal")}
      {...rest}
    >
      <div class={classes().border} data-slot="border" />

      <Show when={hasContent()}>
        <div class={classes().container} data-slot="container">
          <Show when={hasAvatarSlot()}>{renderSlot(slots.avatarSlot())}</Show>
          <Show when={avatarProps()}>
            {(avatar) => (
              <RLAvatar size="xs" {...avatar()} class={classes().avatar} data-slot="avatar" />
            )}
          </Show>

          <Show when={hasIconSlot()}>{renderSlot(slots.iconSlot())}</Show>
          <Show when={iconName()}>
            {(icon) => (
              <span class={classes().icon} data-slot="icon">
                <RLIcon name={icon()} />
              </span>
            )}
          </Show>

          <span class={classes().label} data-slot="label">
            {props.label}
            {children()}
          </span>
        </div>

        <div class={classes().border} data-slot="border" />
      </Show>
    </Tag>
  );
};
