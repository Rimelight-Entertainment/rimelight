import { createMemo, omit, children, type Component, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { ButtonProps } from "./button";
import { buttonTheme } from "./button.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLAvatar } from "../avatar/RLAvatar";

export interface RLButtonProps extends ButtonProps {
  children?: JSX.Element;
  leading?: JSX.Element;
  trailing?: JSX.Element;
  avatar?: any;
  onClick?: (e: MouseEvent) => void;
  type?: "button" | "submit" | "reset";
}

const RLButton: Component<RLButtonProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "variant",
    "color",
    "size",
    "href",
    "to",
    "label",
    "leadingIcon",
    "trailingIcon",
    "avatar",
    "loading",
    "loadingAuto",
    "square",
    "block",
    "justify",
    "active",
    "activeColor",
    "activeVariant",
    "rounded",
    "theme",
    "ui",
    "class",
    "disabled",
    "children",
    "leading",
    "trailing",
    "onClick",
    "type",
    "external",
    "externalIcon",
    "noExternalIcon",
    "target",
    "rel",
    "prefetch",
    "raw",
    "ariaLabel",
    "ariaCurrentValue",
  );

  const resolvedLeading = children(() => props.leading);
  const resolvedTrailing = children(() => props.trailing);
  const resolvedChildren = children(() => props.children);

  const href = () => props.href || (props["to"] as string | undefined);
  const isLink = () => Boolean(href());
  const isLeading = () =>
    !!(props.leadingIcon || props.avatar || resolvedLeading()) || !!props.loading;
  const isTrailing = () =>
    !!(props.trailingIcon || resolvedTrailing()) || (!!props.loading && !isLeading());

  const showLeadingIcon = () => {
    if (props.loading) return "loaderCircle";
    return props.leadingIcon;
  };

  const showTrailingIcon = () => {
    if (props.loading) return "loaderCircle";
    return props.trailingIcon;
  };

  const leadingIconClass = () => (props.loading && isLeading() ? "animate-spin" : "");
  const trailingIconClass = () => (props.loading && isTrailing() ? "animate-spin" : "");

  const classes = createMemo<Record<string, string>>(() =>
    buttonTheme({
      variant:
        props.active && props.activeVariant ? props.activeVariant : (props.variant ?? "solid"),
      color: props.active && props.activeColor ? props.activeColor : (props.color ?? "primary"),
      size: props.size ?? "md",
      justify: props.justify,
      block: props.block,
      square: props.square !== undefined ? props.square : !props.label && !resolvedChildren(),
      rounded: (props["rounded"] as boolean | string | undefined) ?? false,
      leading: isLeading(),
      trailing: isTrailing(),
      loading: props.loading,
      active: props.active,
      theme: props.theme,
      ui: props.ui,
      class: props.class,
    }),
  );

  const buttonContent = () => (
    <>
      <Show when={resolvedLeading()}>{resolvedLeading()}</Show>
      <Show when={!resolvedLeading() && isLeading()}>
        <span class={`${classes()["leadingIcon"]} ${leadingIconClass()}`} data-slot="leading-icon">
          <Show when={props.loading || props.leadingIcon}>
            <RLIcon name={showLeadingIcon()!} size={props.size ?? "md"} aria-hidden="true" />
          </Show>
          <Show when={!props.loading && !props.leadingIcon && props.avatar}>
            <RLAvatar
              {...(typeof props.avatar === "string" ? { src: props.avatar } : props.avatar)}
              size={classes()["leadingAvatarSize"] as any}
              class={classes()["leadingAvatar"]}
              data-slot="leading-avatar"
            />
          </Show>
        </span>
      </Show>

      <Show
        when={resolvedChildren() !== undefined && resolvedChildren() !== null}
        fallback={
          <Show when={props.label !== undefined && props.label !== null}>
            <span class={classes()["label"]} data-slot="label">
              {props.label}
            </span>
          </Show>
        }
      >
        {resolvedChildren()}
      </Show>

      <Show when={resolvedTrailing()}>{resolvedTrailing()}</Show>
      <Show when={!resolvedTrailing() && isTrailing() && showTrailingIcon()}>
        <span
          class={`${classes()["trailingIcon"]} ${trailingIconClass()}`}
          data-slot="trailing-icon"
        >
          <RLIcon name={showTrailingIcon()!} size={props.size ?? "md"} aria-hidden="true" />
        </span>
      </Show>
    </>
  );

  return (
    <Show
      when={isLink()}
      fallback={
        <button
          type={props.type || "button"}
          disabled={props.disabled}
          class={classes()["root"]}
          data-slot="root"
          data-theme={props.theme}
          data-loading={props.loading ? "true" : undefined}
          data-loading-auto={props.loadingAuto ? "true" : undefined}
          aria-label={props.ariaLabel}
          onClick={props.onClick}
          {...rest}
        >
          {buttonContent()}
        </button>
      }
    >
      <a
        href={href()}
        target={props.target}
        rel={props.rel || undefined}
        aria-disabled={props.disabled ? "true" : undefined}
        class={classes()["root"]}
        data-slot="root"
        data-theme={props.theme}
        data-loading={props.loading ? "true" : undefined}
        data-loading-auto={props.loadingAuto ? "true" : undefined}
        aria-label={props.ariaLabel}
        onClick={props.onClick}
        {...rest}
      >
        {buttonContent()}
      </a>
    </Show>
  );
};

export { RLButton };
