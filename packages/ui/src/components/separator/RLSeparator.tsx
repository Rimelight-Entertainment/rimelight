import type { Component } from "solid-js";
import type { RLSeparatorProps } from "./separator.types";
import { RLSeparatorTheme } from "./separator.theme";
import { Show } from "solid-js";
import { RLAvatar } from "../avatar/RLAvatar";

const OMIT_KEYS = ["decorative", "label", "icon", "avatar", "avatarSlot", "iconSlot"] as const;

export const RLSeparator: Component<RLSeparatorProps> = (props) => {
  const { classes, rest } = RLSeparatorTheme.setup(props, { omit: OMIT_KEYS });

  const decorative = () => props.decorative ?? true;

  return (
    <div
      class={classes().root}
      data-slot="root"
      role={decorative() ? "none" : "separator"}
      aria-orientation={decorative() ? undefined : props.orientation}
      {...rest}
    >
      <div class={classes().border} />

      <Show when={props.label || props.icon || props.avatar || props.children}>
        <div class={classes().container} data-slot="container">
          {props.avatarSlot ? (
            props.avatarSlot
          ) : props.avatar ? (
            <RLAvatar
              {...(typeof props.avatar === "string" ? { src: props.avatar } : props.avatar)}
              size={classes().avatarSize as any}
              class={classes().avatar}
              data-slot="avatar"
            />
          ) : null}

          {props.iconSlot ? (
            props.iconSlot
          ) : props.icon ? (
            <span class={classes().icon} data-slot="icon">
              <span class={props.icon} aria-hidden="true" />
            </span>
          ) : null}

          <span class={classes().label} data-slot="label">
            {props.label}
            {props.children}
          </span>
        </div>

        <div class={classes().border} />
      </Show>
    </div>
  );
};
