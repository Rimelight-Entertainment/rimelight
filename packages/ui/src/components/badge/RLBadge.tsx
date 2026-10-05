import type { RLBadgeProps } from "./badge.types";
import { RLBadgeTheme } from "./badge.theme";
import { createMemo, omit, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { RLAvatar } from "../avatar/RLAvatar";

export const RLBadge: Component<RLBadgeProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
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
    "leading-icon" as any,
    "trailing-icon" as any,
    "theme",
    "ui",
    "class",
    "children",
    "leadingSlot",
    "trailingSlot",
  );

  const leadingIconProp = () => props.leadingIcon ?? (props as any)["leading-icon"];
  const trailingIconProp = () => props.trailingIcon ?? (props as any)["trailing-icon"];
  const leadingProp = () => props.leading ?? (props as any)["leading"];
  const trailingProp = () => props.trailing ?? (props as any)["trailing"];
  const iconProp = () => props.icon ?? (props as any)["icon"];

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

  const isSquare = () => Boolean(props.square ?? (props as any)["square"]);

  const resolvedClasses = createMemo(() =>
    RLBadgeTheme({
      variant: props.variant ?? "solid",
      color: props.color ?? "primary",
      size: props.size ?? "md",
      shape: props.shape ?? "rounded",
      square: isSquare(),
      fieldGroup: props.fieldGroup,
      theme: props.theme,
      ui: props.ui
        ? {
            ...props.ui,
            root: props.ui.root ?? props.ui.base,
          }
        : undefined,
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
            class={resolvedClasses().leadingIcon}
            data-slot="leading-icon"
            aria-hidden="true"
          />
        );
      }
      return (
        <span class={resolvedClasses().leadingIcon} data-slot="leading-icon" aria-hidden="true">
          {iconName}
        </span>
      );
    }

    if (props.avatar) {
      if (typeof props.avatar === "string") {
        return (
          <RLAvatar
            src={props.avatar}
            size={resolvedClasses().leadingAvatarSize as any}
            class={resolvedClasses().leadingAvatar}
            data-slot="leading-avatar"
          />
        );
      }
      return (
        <RLAvatar
          {...props.avatar}
          size={(props.avatar.size || resolvedClasses().leadingAvatarSize) as any}
          class={resolvedClasses().leadingAvatar}
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
            class={resolvedClasses().trailingIcon}
            data-slot="trailing-icon"
            aria-hidden="true"
          />
        );
      }
      return (
        <span class={resolvedClasses().trailingIcon} data-slot="trailing-icon" aria-hidden="true">
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
        <span class={resolvedClasses().label} data-slot="label">
          {props.label}
        </span>
      );
    }
    return null;
  };

  return (
    <Root class={resolvedClasses().root} data-slot="root" data-theme={props.theme} {...rest}>
      {isLeading() ? renderLeading() : null}
      {renderContent()}
      {isTrailing() ? renderTrailing() : null}
    </Root>
  );
};
