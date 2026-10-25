import type { RLButtonProps } from "./button.types";
import { RLButtonTheme } from "./button.theme";
import { createMemo, createSignal, Show, type Component } from "solid-js";
import { type JSX } from "@solidjs/web";
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

const OMIT_KEYS = [
  "href",
  "label",
  "leadingIcon",
  "trailingIcon",
  "icon",
  "avatar",
  "loadingAuto",
  "loadingIcon",
  "activeColor",
  "activeVariant",
  "activeClass",
  "inactiveClass",
  "exactActiveClass",
  "disabled",
  "leadingSlot",
  "trailingSlot",
  "onClick",
  "onKeyDown",
  "type",
  "external",
  "localize",
  "externalIcon",
  "noExternalIcon",
  "target",
  "rel",
  "noRel",
  "raw",
  "ariaLabel",
  "ariaLabelledby",
  "ariaCurrentValue",
] as const;

const shallowEqual = <T extends Record<string, unknown>>(prev: T, next: T): boolean => {
  if (prev === next) return true;
  const prevKeys = Object.keys(prev);
  if (prevKeys.length !== Object.keys(next).length) return false;
  for (const key of prevKeys) {
    if (!Object.is(prev[key], next[key])) return false;
  }
  return true;
};

const NATIVE_BUTTON_TAGS = new Set(["button", "input", "select", "textarea", "summary"]);
const DISABLED_TAGS = new Set([
  "button",
  "input",
  "select",
  "textarea",
  "fieldset",
  "optgroup",
  "option",
  "datalist",
]);
const TYPE_TAGS = new Set(["button", "input"]);

export const RLButton: Component<RLButtonProps> = (props) => {
  const [autoLoading, setAutoLoading] = createSignal(false);

  const leadingIconProp = () => props.leadingIcon;
  const trailingIconProp = () => props.trailingIcon;
  const leadingFlag = () => (typeof props.leading === "boolean" ? props.leading : undefined);
  const trailingFlag = () => (typeof props.trailing === "boolean" ? props.trailing : undefined);
  const iconProp = () => props.icon;

  const isLoading = () => Boolean(props.loading || autoLoading());
  const isDisabled = () => Boolean(props.disabled || isLoading());

  const href = () => props.href;
  const isLink = () => Boolean(href());

  const linkAttrs = createMemo(
    () =>
      resolveLinkAttrs({
        href: href(),
        external: props.external,
        localize: props.localize,
        target: props.target,
        rel: props.noRel ? "" : (props.rel ?? undefined),
        active: props.active,
        ariaCurrentValue: props.ariaCurrentValue,
        disabled: isDisabled(),
      }),
    { equals: shallowEqual },
  );

  const isIconOnly = () => !props.label && !props.children;

  const externalIconName = () => {
    if (isIconOnly() || !props.external || props.noExternalIcon) return undefined;
    return props.externalIcon || "external-link";
  };

  const ariaLabel = () => props.ariaLabel;
  const ariaLabelledby = () => props.ariaLabelledby;

  const showExternalHint = () => isLink() && linkAttrs().target === "_blank" && !ariaLabel();

  const isTrailingPosition = () =>
    Boolean(
      props.trailingSlot ||
      (props.trailing !== undefined && typeof props.trailing !== "boolean") ||
      trailingIconProp() ||
      (iconProp() && trailingFlag() === true) ||
      externalIconName() ||
      (isLoading() && trailingFlag() === true && leadingFlag() !== true),
    );

  const isLeadingPosition = () =>
    Boolean(
      props.leadingSlot ||
      (props.leading !== undefined && typeof props.leading !== "boolean") ||
      leadingIconProp() ||
      (iconProp() && trailingFlag() !== true) ||
      props.avatar ||
      (isLoading() && !isTrailingPosition()) ||
      leadingFlag() === true,
    );

  const leadingIconName = () => {
    if (isLoading() && !isTrailingPosition()) {
      return props.loadingIcon || "loader-circle";
    }
    return leadingIconProp() || (iconProp() && trailingFlag() !== true ? iconProp() : undefined);
  };

  const trailingIconName = () => {
    if (isLoading() && isTrailingPosition()) {
      return props.loadingIcon || "loader-circle";
    }
    return (
      trailingIconProp() ||
      (iconProp() && trailingFlag() === true ? iconProp() : undefined) ||
      externalIconName()
    );
  };

  const isSquare = () => Boolean(props.square) || (!props.label && !props.children);

  const rootClassOverride = () => {
    const activeCls = props.active ? props.activeClass : props.inactiveClass;
    const directClass = props.class;
    if (activeCls && directClass) return `${activeCls} ${directClass}`;
    return activeCls || directClass || undefined;
  };

  const {
    Tag: CustomRoot,
    classes,
    rest,
  } = RLButtonTheme.setup(props, {
    omit: OMIT_KEYS,
    variants: () => ({
      variant:
        props.active && props.activeVariant ? props.activeVariant : (props.variant ?? "solid"),
      color: props.active && props.activeColor ? props.activeColor : (props.color ?? "primary"),
      size: props.size ?? "md",
      justify: props.justify,
      block: props.block,
      square: isSquare(),
      fieldGroup: props.fieldGroup,
      rounded: props.rounded ?? false,
      leading: isLeadingPosition(),
      trailing: isTrailingPosition(),
      loading: isLoading(),
      active: props.active,
      class: rootClassOverride(),
    }),
  });

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
    const userHandler = props.onKeyDown as ((event: KeyboardEvent) => unknown) | undefined;
    if (userHandler) userHandler(e);

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

  const asTag = () => (typeof props.as === "string" ? props.as.toLowerCase() : undefined);

  const isNativeButtonish = () => {
    const tag = asTag();
    return tag !== undefined && NATIVE_BUTTON_TAGS.has(tag);
  };

  const acceptsDisabled = () => {
    const tag = asTag();
    return tag === undefined || DISABLED_TAGS.has(tag);
  };

  const targetValue = () => linkAttrs().target;
  const relValue = () => linkAttrs().rel;

  const isCustomRoot = () => !isLink() && Boolean(props.as) && props.as !== "button";

  const buttonContent = () => (
    <>
      <Show when={props.leadingSlot !== undefined && props.leadingSlot !== null}>
        {props.leadingSlot}
      </Show>
      <Show when={props.leadingSlot === undefined || props.leadingSlot === null}>
        <Show when={props.leading !== undefined && typeof props.leading !== "boolean"}>
          {props.leading as JSX.Element}
        </Show>
        <Show when={props.leading === undefined || typeof props.leading === "boolean"}>
          <Show when={leadingIconName()}>
            {(iconName) => (
              <RLIcon
                name={iconName()}
                size="none"
                class={classes()["leadingIcon"]}
                data-slot="leading-icon"
                aria-hidden="true"
              />
            )}
          </Show>
          <Show when={!leadingIconName() && props.avatar && !isLoading()}>
            <span class={classes()["leadingAvatar"]} data-slot="leading-avatar">
              <RLAvatar
                {...(typeof props.avatar === "string" ? { src: props.avatar } : props.avatar)}
                size={
                  (typeof props.avatar === "object" && props.avatar?.size) ||
                  (classes()["leadingAvatarSize"] as any)
                }
                class={classes()["leadingAvatar"]}
              />
            </span>
          </Show>
        </Show>
      </Show>

      <Show when={props.children !== undefined && props.children !== null}>{props.children}</Show>
      <Show
        when={
          (props.children === undefined || props.children === null) &&
          props.label !== undefined &&
          props.label !== null
        }
      >
        <span class={classes()["label"]} data-slot="label">
          {props.label}
        </span>
      </Show>

      <Show when={props.trailingSlot !== undefined && props.trailingSlot !== null}>
        {props.trailingSlot}
      </Show>
      <Show when={props.trailingSlot === undefined || props.trailingSlot === null}>
        <Show when={props.trailing !== undefined && typeof props.trailing !== "boolean"}>
          {props.trailing as JSX.Element}
        </Show>
        <Show when={props.trailing === undefined || typeof props.trailing === "boolean"}>
          <Show when={trailingIconName()}>
            {(iconName) => (
              <RLIcon
                name={iconName()}
                size="none"
                class={classes()["trailingIcon"]}
                data-slot="trailing-icon"
                aria-hidden="true"
              />
            )}
          </Show>
        </Show>
      </Show>
    </>
  );

  const externalHint = () => (
    <Show when={showExternalHint()}>
      <span class={classes()["externalHint"]} data-slot="external-hint">
        {uiT("link.opensInNewTab")}
      </span>
    </Show>
  );

  const rootClass = () => classes()["root"];

  return (
    <Show
      when={isLink()}
      fallback={
        <Show
          when={isCustomRoot()}
          fallback={
            <button
              type={props.type || "button"}
              disabled={isDisabled()}
              aria-disabled={isDisabled() ? "true" : undefined}
              class={rootClass()}
              data-slot="root"
              data-theme={props.theme}
              data-loading={isLoading() ? "true" : undefined}
              data-loading-auto={props.loadingAuto ? "true" : undefined}
              aria-label={ariaLabel()}
              aria-labelledby={ariaLabelledby()}
              aria-busy={isLoading() ? "true" : undefined}
              onClick={handleClick}
              {...rest}
            >
              {buttonContent()}
            </button>
          }
        >
          <CustomRoot
            disabled={acceptsDisabled() ? isDisabled() : undefined}
            aria-disabled={isDisabled() ? "true" : undefined}
            role={isNativeButtonish() ? undefined : "button"}
            tabindex={isDisabled() ? -1 : 0}
            type={TYPE_TAGS.has(asTag() ?? "") ? props.type || "button" : undefined}
            class={rootClass()}
            data-slot="root"
            data-theme={props.theme}
            data-loading={isLoading() ? "true" : undefined}
            data-loading-auto={props.loadingAuto ? "true" : undefined}
            aria-label={ariaLabel()}
            aria-labelledby={ariaLabelledby()}
            aria-busy={isLoading() ? "true" : undefined}
            onClick={handleClick}
            onKeyDown={isNativeButtonish() ? undefined : handleKeyDown}
            {...rest}
          >
            {buttonContent()}
          </CustomRoot>
        </Show>
      }
    >
      <a
        href={linkAttrs().href}
        target={targetValue()}
        rel={relValue()}
        aria-disabled={isDisabled() ? "true" : undefined}
        aria-current={linkAttrs().ariaCurrent}
        tabindex={isDisabled() ? -1 : undefined}
        class={rootClass()}
        data-slot="root"
        data-theme={props.theme}
        data-loading={isLoading() ? "true" : undefined}
        data-loading-auto={props.loadingAuto ? "true" : undefined}
        aria-label={ariaLabel()}
        aria-labelledby={ariaLabelledby()}
        aria-busy={isLoading() ? "true" : undefined}
        onClick={handleClick}
        {...rest}
      >
        {buttonContent()}
        {externalHint()}
      </a>
    </Show>
  );
};
