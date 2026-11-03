import type { Component } from "solid-js";
import type { RLBadgeProps } from "./badge.types";
import type { RLAvatarProps } from "../avatar/avatar.types";
import { RLBadgeTheme } from "./badge.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLAvatar } from "../avatar/RLAvatar";

const OMIT_KEYS = [
  "label",
  "icon",
  "avatar",
  "leading",
  "leadingIcon",
  "trailing",
  "trailingIcon",
] as const;

const BADGE_ICON_SIZE = { xs: "xs", sm: "xs", md: "sm", lg: "md", xl: "lg" } as const;

export const RLBadge: Component<RLBadgeProps> = (props) => {
  const isLeading = () =>
    Boolean(
      props.leading ||
      (props.icon && !props.trailing) ||
      props.leadingIcon ||
      props.avatar ||
      slots.leadingSlot(),
    );

  const leadingIconName = () =>
    props.leadingIcon || (props.icon && !props.trailing ? props.icon : undefined);

  const isTrailing = () =>
    Boolean(
      props.trailing ||
      (props.icon && props.trailing) ||
      props.trailingIcon ||
      slots.trailingSlot(),
    );

  const trailingIconName = () =>
    props.trailingIcon || (props.icon && props.trailing ? props.icon : undefined);

  // Without a size prop the theme default (md) applies, which maps to "sm".
  const iconSize = () => (props.size ? BADGE_ICON_SIZE[props.size] : "sm");

  const { Tag, classes, rest, slots, children, theme } = RLBadgeTheme.setup(props, {
    as: "span",
    omit: OMIT_KEYS,
    slots: ["leadingSlot", "trailingSlot"] as const,
    variants: () => ({ square: props.square }),
  });

  const renderLeading = () => {
    if (slots.leadingSlot() !== undefined && slots.leadingSlot() !== null) {
      return slots.leadingSlot();
    }

    const iconName = leadingIconName();
    if (iconName) {
      return (
        <RLIcon
          name={iconName}
          size={iconSize()}
          class={classes().leadingIcon}
          data-slot="leading-icon"
          aria-hidden="true"
        />
      );
    }

    if (props.avatar) {
      if (typeof props.avatar === "string") {
        return (
          <RLAvatar
            src={props.avatar}
            size={classes().leadingAvatarSize as RLAvatarProps["size"]}
            class={classes().leadingAvatar}
            data-slot="leading-avatar"
          />
        );
      }
      return (
        <RLAvatar
          {...props.avatar}
          size={(props.avatar.size || classes().leadingAvatarSize) as RLAvatarProps["size"]}
          class={classes().leadingAvatar}
          data-slot="leading-avatar"
        />
      );
    }

    return null;
  };

  const renderTrailing = () => {
    if (slots.trailingSlot() !== undefined && slots.trailingSlot() !== null) {
      return slots.trailingSlot();
    }

    const iconName = trailingIconName();
    if (iconName) {
      return (
        <RLIcon
          name={iconName}
          size={iconSize()}
          class={classes().trailingIcon}
          data-slot="trailing-icon"
          aria-hidden="true"
        />
      );
    }

    return null;
  };

  const renderContent = () => {
    if (children() !== undefined && children() !== null) {
      return children();
    }
    if (props.label !== undefined && props.label !== null) {
      return (
        <span class={classes().label} data-slot="label">
          {props.label}
        </span>
      );
    }
    return null;
  };

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {isLeading() ? renderLeading() : null}
      {renderContent()}
      {isTrailing() ? renderTrailing() : null}
    </Tag>
  );
};
