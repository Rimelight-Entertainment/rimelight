import type { RLButtonProps } from "./button.types";
import type { RLAvatarProps } from "../avatar/avatar.types";
import { RLButtonTheme } from "./button.theme";
import { createMemo, createSignal, Show, type Component } from "solid-js";

import {
  isThenable,
  resolveKeyboardAction,
  runClickHandlers,
  toClickHandlers,
} from "./button.helpers";
import { resolveLinkAttrs } from "../link/helpers";
import { uiT } from "../../locale";
import { RLIcon } from "../icon/RLIcon";
import { RLAvatar } from "../avatar/RLAvatar";

type SlotPresence = { leadingSlot: () => unknown; trailingSlot: () => unknown };

const OMIT_KEYS = [
  "label",
  "icon",
  "avatar",
  "leading",
  "leadingIcon",
  "trailing",
  "trailingIcon",
  "loading",
  "loadingIcon",
  "loadingAuto",
  "activeColor",
  "activeVariant",
  "activeClass",
  "inactiveClass",
  "disabled",
  "onClick",
  "onKeyDown",
  "type",
  "href",
  "external",
  "localize",
  "externalIcon",
  "noExternalIcon",
  "target",
  "rel",
  "noRel",
  "current",
  "ref",
] as const;

const ICON_SIZE = { xs: "sm", sm: "sm", md: "md", lg: "md", xl: "lg" } as const;

const shallowEqual = <T extends Record<string, unknown>>(prev: T, next: T): boolean => {
  if (prev === next) return true;
  const prevKeys = Object.keys(prev);
  if (prevKeys.length !== Object.keys(next).length) return false;
  for (const key of prevKeys) {
    if (!Object.is(prev[key], next[key])) return false;
  }
  return true;
};

export const RLButton: Component<RLButtonProps> = (props) => {
  const [autoLoading, setAutoLoading] = createSignal(false);

  const leadingFlag = () => (typeof props.leading === "boolean" ? props.leading : undefined);
  const trailingFlag = () => (typeof props.trailing === "boolean" ? props.trailing : undefined);

  const isLoading = () => Boolean(props.loading || autoLoading());
  const isDisabled = () => Boolean(props.disabled || isLoading());
  const isLink = () => Boolean(props.href);
  const iconSize = () => (props.size ? ICON_SIZE[props.size] : undefined);

  const linkAttrs = createMemo(
    () =>
      resolveLinkAttrs({
        href: props.href,
        external: props.external,
        localize: props.localize,
        target: props.target,
        rel: props.noRel ? "" : (props.rel ?? undefined),
        active: props.active,
        current: props.current,
        disabled: isDisabled(),
      }),
    { equals: shallowEqual },
  );

  const externalIconName = () => {
    if (!props.external || props.noExternalIcon) return undefined;
    return props.externalIcon || "external-link";
  };

  const showExternalHint = () =>
    isLink() && linkAttrs().target === "_blank" && !props["aria-label"];

  const isTrailingPosition = (s: SlotPresence) =>
    Boolean(
      s.trailingSlot() ||
      props.trailingIcon ||
      (props.icon && trailingFlag() === true) ||
      externalIconName() ||
      (isLoading() && trailingFlag() === true && leadingFlag() !== true),
    );

  const isLeadingPosition = (s: SlotPresence) =>
    Boolean(
      s.leadingSlot() ||
      props.leadingIcon ||
      (props.icon && trailingFlag() !== true) ||
      props.avatar ||
      (isLoading() && !isTrailingPosition(s)) ||
      leadingFlag() === true,
    );

  const isIconOnlyChildren = (childrenAccessor: () => unknown): boolean =>
    !props.label && childrenAccessor() === undefined;

  const { Tag, classes, rest, slots, children, theme, tagProp } = RLButtonTheme.setup(props, {
    as: "button",
    omit: OMIT_KEYS,
    slots: ["leadingSlot", "trailingSlot"] as const,
    variants: (s, childrenAccessor) => ({
      variant: props.active && props.activeVariant ? props.activeVariant : props.variant,
      color: props.active && props.activeColor ? props.activeColor : props.color,
      size: props.size,
      justify: props.justify,
      block: props.block,
      square: props.square || isIconOnlyChildren(childrenAccessor),
      fieldGroup: props.fieldGroup,
      rounded: props.rounded,
      leading: isLeadingPosition(s),
      trailing: isTrailingPosition(s),
      loading: isLoading(),
      active: props.active,
    }),
  });

  const isIconOnly = (): boolean => isIconOnlyChildren(children);
  const isNativeTag = () =>
    tagProp() === undefined || tagProp() === "button" || tagProp() === "input";

  const rootClass = () =>
    [classes().root, props.active ? props.activeClass : props.inactiveClass]
      .filter(Boolean)
      .join(" ");

  const leadingIconName = () => {
    if (isLoading() && !isTrailingPosition(slots)) {
      return props.loadingIcon || "loader-circle";
    }
    return props.leadingIcon || (props.icon && trailingFlag() !== true ? props.icon : undefined);
  };

  const trailingIconName = () => {
    if (isLoading() && isTrailingPosition(slots)) {
      return props.loadingIcon || "loader-circle";
    }
    return (
      props.trailingIcon ||
      (props.icon && trailingFlag() === true ? props.icon : undefined) ||
      (isIconOnly() ? undefined : externalIconName())
    );
  };

  const handleClick = (e: MouseEvent) => {
    if (isDisabled()) {
      e.preventDefault();
      return;
    }
    const handlers = toClickHandlers(props.onClick);
    if (!handlers.length) return;

    const results = runClickHandlers(handlers, e);

    if (props.loadingAuto && results.some(isThenable)) {
      setAutoLoading(true);
      void Promise.all(results).finally(() => {
        setAutoLoading(false);
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    props.onKeyDown?.(e);
    if (e.currentTarget instanceof HTMLButtonElement) return;

    const action = resolveKeyboardAction({
      key: e.key,
      repeat: e.repeat,
      disabled: isDisabled(),
      defaultPrevented: e.defaultPrevented,
    });

    if (action === "prevent") {
      e.preventDefault();
      return;
    }
    if (action === "click") {
      e.preventDefault();
      (e.currentTarget as HTMLElement | null)?.click();
    }
  };

  const buttonContent = () => (
    <>
      <Show when={slots.leadingSlot() !== undefined && slots.leadingSlot() !== null}>
        {slots.leadingSlot()}
      </Show>
      <Show when={slots.leadingSlot() === undefined || slots.leadingSlot() === null}>
        <Show when={leadingIconName()}>
          {(iconName) => (
            <RLIcon
              name={iconName()}
              size={iconSize()}
              class={classes().leadingIcon}
              data-slot="leading-icon"
              aria-hidden="true"
            />
          )}
        </Show>
        <Show when={!leadingIconName() && props.avatar && !isLoading()}>
          <span class={classes().leadingAvatar} data-slot="leading-avatar">
            <RLAvatar
              {...(typeof props.avatar === "string" ? { src: props.avatar } : props.avatar)}
              size={
                (typeof props.avatar === "object" && props.avatar?.size) ||
                (classes().leadingAvatarSize as RLAvatarProps["size"])
              }
              class={classes().leadingAvatar}
            />
          </span>
        </Show>
      </Show>

      <Show when={children() !== undefined && children() !== null}>{children()}</Show>
      <Show
        when={
          (children() === undefined || children() === null) &&
          props.label !== undefined &&
          props.label !== null
        }
      >
        <span class={classes().label} data-slot="label">
          {props.label}
        </span>
      </Show>

      <Show when={slots.trailingSlot() !== undefined && slots.trailingSlot() !== null}>
        {slots.trailingSlot()}
      </Show>
      <Show when={slots.trailingSlot() === undefined || slots.trailingSlot() === null}>
        <Show when={trailingIconName()}>
          {(iconName) => (
            <RLIcon
              name={iconName()}
              size={iconSize()}
              class={classes().trailingIcon}
              data-slot="trailing-icon"
              aria-hidden="true"
            />
          )}
        </Show>
      </Show>
    </>
  );

  const externalHint = () => (
    <Show when={showExternalHint()}>
      <span class={classes().externalHint} data-slot="external-hint">
        {uiT("link.opens-in-new-tab")}
      </span>
    </Show>
  );

  return (
    <Show
      when={isLink()}
      fallback={
        <Tag
          type={isNativeTag() ? props.type || "button" : undefined}
          disabled={isDisabled()}
          aria-disabled={isDisabled() ? "true" : undefined}
          role={isNativeTag() ? undefined : "button"}
          tabindex={isNativeTag() ? undefined : isDisabled() ? -1 : 0}
          class={rootClass()}
          data-slot="root"
          data-theme={theme()}
          data-loading={isLoading() ? "true" : undefined}
          data-loading-auto={props.loadingAuto ? "true" : undefined}
          aria-busy={isLoading() ? "true" : undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          ref={props.ref}
          {...rest}
        >
          {buttonContent()}
        </Tag>
      }
    >
      <a
        href={linkAttrs().href}
        target={linkAttrs().target}
        rel={linkAttrs().rel}
        aria-disabled={isDisabled() ? "true" : undefined}
        aria-current={linkAttrs().ariaCurrent}
        tabindex={isDisabled() ? -1 : undefined}
        class={rootClass()}
        data-slot="root"
        data-theme={theme()}
        data-loading={isLoading() ? "true" : undefined}
        data-loading-auto={props.loadingAuto ? "true" : undefined}
        aria-busy={isLoading() ? "true" : undefined}
        onClick={handleClick}
        ref={props.ref}
        {...rest}
      >
        {buttonContent()}
        {externalHint()}
      </a>
    </Show>
  );
};
