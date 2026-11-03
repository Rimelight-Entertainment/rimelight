import type { Component } from "solid-js";
import type { RLBadgeProps } from "./badge.types";
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

export const RLBadge: Component<RLBadgeProps> = (props) => {
  const leadingIconProp = () => props.leadingIcon;
  const trailingIconProp = () => props.trailingIcon;
  const leadingProp = () => props.leading;
  const trailingProp = () => props.trailing;
  const iconProp = () => props.icon;

  const isLeading = () =>
    Boolean(
      leadingProp() ||
      (iconProp() && !trailingProp()) ||
      leadingIconProp() ||
      props.avatar ||
      slots.leadingSlot(),
    );

  const leadingIconName = () =>
    leadingIconProp() || (iconProp() && !trailingProp() ? iconProp() : undefined);

  const isTrailing = () =>
    Boolean(
      trailingProp() ||
      (iconProp() && trailingProp()) ||
      trailingIconProp() ||
      slots.trailingSlot(),
    );

  const trailingIconName = () =>
    trailingIconProp() || (iconProp() && trailingProp() ? iconProp() : undefined);

  const isSquare = () => Boolean(props.square);

  const {
    Tag: Root,
    classes,
    rest,
    slots,
  } = RLBadgeTheme.setup(props, {
    as: "span",
    omit: OMIT_KEYS,
    slots: ["leadingSlot", "trailingSlot"] as const,
    variants: () => ({ square: isSquare() }),
  });

  const renderLeading = () => {
    if (slots.leadingSlot() !== undefined && slots.leadingSlot() !== null) {
      return slots.leadingSlot();
    }

    const iconName = leadingIconName();
    if (iconName) {
      if (typeof iconName === "string") {
        return (
          <RLIcon
            name={iconName}
            class={classes().leadingIcon}
            data-slot="leading-icon"
            aria-hidden="true"
          />
        );
      }
      return (
        <span class={classes().leadingIcon} data-slot="leading-icon" aria-hidden="true">
          {iconName}
        </span>
      );
    }

    if (props.avatar) {
      if (typeof props.avatar === "string") {
        return (
          <RLAvatar
            src={props.avatar}
            size={classes().leadingAvatarSize as any}
            class={classes().leadingAvatar}
            data-slot="leading-avatar"
          />
        );
      }
      return (
        <RLAvatar
          {...props.avatar}
          size={(props.avatar.size || classes().leadingAvatarSize) as any}
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
      if (typeof iconName === "string") {
        return (
          <RLIcon
            name={iconName}
            class={classes().trailingIcon}
            data-slot="trailing-icon"
            aria-hidden="true"
          />
        );
      }
      return (
        <span class={classes().trailingIcon} data-slot="trailing-icon" aria-hidden="true">
          {iconName}
        </span>
      );
    }

    return null;
  };

  const renderContent = () => {
    if (props.children !== undefined && props.children !== null) {
      return props.children;
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
    <Root class={classes().root} data-slot="root" data-theme={props.theme} {...rest}>
      {isLeading() ? renderLeading() : null}
      {renderContent()}
      {isTrailing() ? renderTrailing() : null}
    </Root>
  );
};
