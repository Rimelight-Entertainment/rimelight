import type { RLSeparatorProps } from "./separator.types";
import { RLSeparatorTheme } from "./separator.theme";
import { children, createMemo, omit, type Component } from "solid-js";
import { RLAvatar } from "../avatar/RLAvatar";

export const RLSeparator: Component<RLSeparatorProps> = (props) => {
  const resolvedChildren = children(() => props.children);
  const resolvedAvatarSlot = children(() => props.avatarSlot);
  const resolvedIconSlot = children(() => props.iconSlot);

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

  const decorative = props.decorative ?? true;

  return (
    <div
      class={classes()["root"]}
      data-slot="root"
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : props.orientation}
      {...rest}
    >
      <div class={classes()["border"]} />

      {(props.label || props.icon || props.avatar || resolvedChildren()) && (
        <>
          <div class={classes()["container"]} data-slot="container">
            {resolvedAvatarSlot() ? (
              resolvedAvatarSlot()
            ) : props.avatar ? (
              <RLAvatar
                {...(typeof props.avatar === "string" ? { src: props.avatar } : props.avatar)}
                size={classes()["avatarSize"] as any}
                class={classes()["avatar"]}
                data-slot="avatar"
              />
            ) : null}

            {resolvedIconSlot() ? (
              resolvedIconSlot()
            ) : props.icon ? (
              <span class={classes()["icon"]} data-slot="icon">
                <span class={props.icon} aria-hidden="true" />
              </span>
            ) : null}

            <span class={classes()["label"]} data-slot="label">
              {props.label}
              {resolvedChildren()}
            </span>
          </div>

          <div class={classes()["border"]} />
        </>
      )}
    </div>
  );
};
