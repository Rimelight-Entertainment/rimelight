import type { Component } from "solid-js";
import type { RLSeparatorProps } from "./separator.types";
import type { RLAvatarProps } from "../avatar/avatar.types";
import { RLSeparatorTheme } from "./separator.theme";
import { Show } from "solid-js";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = ["decorative", "label", "icon", "avatar"] as const;

export const RLSeparator: Component<RLSeparatorProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLSeparatorTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["avatarSlot", "iconSlot"] as const,
  });

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      role={(props.decorative ?? true) ? "none" : "separator"}
      aria-orientation={(props.decorative ?? true) ? undefined : props.orientation}
      {...rest}
    >
      <div class={classes().border} />

      <Show when={props.label || props.icon || props.avatar || children()}>
        <div class={classes().container} data-slot="container">
          {slots.avatarSlot() ? (
            slots.avatarSlot()
          ) : props.avatar ? (
            <RLAvatar
              {...(typeof props.avatar === "string" ? { src: props.avatar } : props.avatar)}
              size={classes().avatarSize as RLAvatarProps["size"]}
              class={classes().avatar}
              data-slot="avatar"
            />
          ) : null}

          {slots.iconSlot() ? (
            slots.iconSlot()
          ) : props.icon ? (
            <span class={classes().icon} data-slot="icon">
              <RLIcon name={props.icon} />
            </span>
          ) : null}

          <span class={classes().label} data-slot="label">
            {props.label}
            {children()}
          </span>
        </div>

        <div class={classes().border} />
      </Show>
    </Tag>
  );
};
