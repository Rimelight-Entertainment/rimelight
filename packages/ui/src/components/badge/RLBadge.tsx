import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { RLBadgeProps } from "./badge.types";
import type { RLAvatarProps } from "../avatar/avatar.types";
import { RLBadgeTheme } from "./badge.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLAvatar } from "../avatar/RLAvatar";
import { renderSlot } from "../../slot";

const OMIT_KEYS = ["label", "icon", "avatar", "leadingIcon", "trailing", "trailingIcon"] as const;

const BADGE_ICON_SIZE = { xs: "xs", sm: "xs", md: "sm", lg: "md", xl: "lg" } as const;

export const RLBadge: Component<RLBadgeProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLBadgeTheme.setup(props, {
    as: "span",
    omit: OMIT_KEYS,
    slots: ["leadingSlot", "trailingSlot"] as const,
  });

  const leadingIconName = () =>
    props.leadingIcon || (props.icon && !props.trailing ? props.icon : undefined);

  const trailingIconName = () =>
    props.trailingIcon || (props.icon && props.trailing ? props.icon : undefined);

  const hasLeading = () => Boolean(slots.leadingSlot() || leadingIconName() || props.avatar);

  const hasTrailing = () => Boolean(slots.trailingSlot() || trailingIconName());

  const hasChildren = () => children() !== undefined && children() !== null;

  const hasLabel = () => props.label !== undefined;

  // Without a size prop the theme default (md) applies, which maps to "sm".
  const iconSize = () => (props.size ? BADGE_ICON_SIZE[props.size] : "sm");

  const renderAvatar = (avatar: RLAvatarProps | string) => {
    const avatarProps: RLAvatarProps = typeof avatar === "string" ? { src: avatar } : avatar;
    return (
      <RLAvatar
        {...avatarProps}
        size={avatarProps.size ?? "xs"}
        class={classes().leadingAvatar}
        data-slot="leading-avatar"
      />
    );
  };

  const renderLeading = () => (
    <Show
      when={slots.leadingSlot()}
      fallback={
        <Show
          when={leadingIconName()}
          fallback={<Show when={props.avatar}>{(avatar) => renderAvatar(avatar())}</Show>}
        >
          {(name) => (
            <RLIcon
              name={name()}
              size={iconSize()}
              class={classes().leadingIcon}
              data-slot="leading-icon"
              aria-hidden="true"
            />
          )}
        </Show>
      }
    >
      {(node) => (
        <span class={classes().leadingSlot} data-slot="leading-slot">
          {renderSlot(node())}
        </span>
      )}
    </Show>
  );

  const renderTrailing = () => (
    <Show
      when={slots.trailingSlot()}
      fallback={
        <Show when={trailingIconName()}>
          {(name) => (
            <RLIcon
              name={name()}
              size={iconSize()}
              class={classes().trailingIcon}
              data-slot="trailing-icon"
              aria-hidden="true"
            />
          )}
        </Show>
      }
    >
      {(node) => (
        <span class={classes().trailingSlot} data-slot="trailing-slot">
          {renderSlot(node())}
        </span>
      )}
    </Show>
  );

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      <Show when={hasLeading()}>{renderLeading()}</Show>
      <Show
        when={hasChildren()}
        fallback={
          <Show when={hasLabel()}>
            <span class={classes().label} data-slot="label">
              {props.label}
            </span>
          </Show>
        }
      >
        {children()}
      </Show>
      <Show when={hasTrailing()}>{renderTrailing()}</Show>
    </Tag>
  );
};
