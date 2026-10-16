import type { RLSeparatorProps } from "./separator.types";
import { RLSeparatorTheme } from "./separator.theme";
import { createMemo, omit, Show, type Component } from "solid-js";
import { RLAvatar } from "../avatar/RLAvatar";

export const RLSeparator: Component<RLSeparatorProps> = (props) => {
  const rest = omit(
    props,
    "color",
    "size",
    "type",
    "position",
    "orientation",
    "decorative",
    "label",
    "icon",
    "avatar",
    "ui",
    "class",
    "children",
    "avatarSlot",
    "iconSlot",
  );

  const classes = createMemo(() =>
    RLSeparatorTheme({
      color: props.color ?? "neutral",
      size: props.size ?? "xs",
      type: props.type ?? "solid",
      position: props.position,
      orientation: props.orientation ?? "horizontal",
      ui: props.ui,
      class: props.class,
    }),
  );

  const decorative = () => props.decorative ?? true;

  return (
    <div
      class={classes()["root"]}
      data-slot="root"
      role={decorative() ? "none" : "separator"}
      aria-orientation={decorative() ? undefined : props.orientation}
      {...rest}
    >
      <div class={classes()["border"]} />

      <Show when={props.label || props.icon || props.avatar || props.children}>
        <div class={classes()["container"]} data-slot="container">
          {props.avatarSlot ? (
            props.avatarSlot
          ) : props.avatar ? (
            <RLAvatar
              {...(typeof props.avatar === "string" ? { src: props.avatar } : props.avatar)}
              size={classes()["avatarSize"] as any}
              class={classes()["avatar"]}
              data-slot="avatar"
            />
          ) : null}

          {props.iconSlot ? (
            props.iconSlot
          ) : props.icon ? (
            <span class={classes()["icon"]} data-slot="icon">
              <span class={props.icon} aria-hidden="true" />
            </span>
          ) : null}

          <span class={classes()["label"]} data-slot="label">
            {props.label}
            {props.children}
          </span>
        </div>

        <div class={classes()["border"]} />
      </Show>
    </div>
  );
};
