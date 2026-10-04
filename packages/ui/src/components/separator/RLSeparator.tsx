import { children, createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { SeparatorProps } from "./separator";
import { separatorTheme } from "./separator.theme";
import { RLAvatar } from "../avatar/RLAvatar";

export interface RLSeparatorProps extends SeparatorProps {
  children?: JSX.Element;
  avatarSlot?: JSX.Element;
  iconSlot?: JSX.Element;
  label?: any;
  icon?: string;
  avatar?: string | Record<string, any>;
}

export const RLSeparator: Component<RLSeparatorProps> = (allProps) => {
  const props = allProps;
  const resolvedChildren = children(() => props.children);
  const resolvedAvatarSlot = children(() => props.avatarSlot);
  const resolvedIconSlot = children(() => props.iconSlot);

  const rest = omit(
    allProps,
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
    separatorTheme({
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
