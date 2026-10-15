import type { RLBadgeProps } from "./badge.types";
import { RLBadgeTheme } from "./badge.theme";
import { createMemo, omit, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { RLAvatar } from "../avatar/RLAvatar";

export const RLBadge: Component<RLBadgeProps> = (props) => {
  const rest = omit(
    props,
    "as",
    "label",
    "variant",
    "color",
    "size",
    "shape",
    "square",
    "fieldGroup",
    "icon",
    "avatar",
    "leading",
    "leadingIcon",
    "trailing",
    "trailingIcon",
    "theme",
    "ui",
    "class",
    "children",
    "leadingSlot",
    "trailingSlot",
  );

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
      props.leadingSlot,
    );

  const leadingIconName = () =>
    leadingIconProp() || (iconProp() && !trailingProp() ? iconProp() : undefined);

  const isTrailing = () =>
    Boolean(
      trailingProp() || (iconProp() && trailingProp()) || trailingIconProp() || props.trailingSlot,
    );

  const trailingIconName = () =>
    trailingIconProp() || (iconProp() && trailingProp() ? iconProp() : undefined);

  const isSquare = () => Boolean(props.square);

  const classes = createMemo(() =>
    RLBadgeTheme({
      variant: props.variant ?? "solid",
      color: props.color ?? "primary",
      size: props.size ?? "md",
      shape: props.shape ?? "rounded",
      square: isSquare(),
      fieldGroup: props.fieldGroup,
      ui: props.ui,
      class: props.class,
    }),
  );

  const Root = dynamic(() => props.as ?? "span");

  const renderLeading = () => {
    if (props.leadingSlot !== undefined && props.leadingSlot !== null) {
      return props.leadingSlot;
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
    if (props.trailingSlot !== undefined && props.trailingSlot !== null) {
      return props.trailingSlot;
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
