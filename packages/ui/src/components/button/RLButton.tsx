import type { RLButtonProps } from "./button.types";
import { RLButtonTheme } from "./button.theme";
import { createMemo, createSignal, Show, type Component } from "solid-js";
import { dynamic, type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import {
  isThenable,
  resolveKeyboardAction,
  runClickHandlers,
  toClickHandlers,
} from "./button.helpers";
import { resolveLinkAttrs } from "../link/helpers";
import { RLIcon } from "../icon/RLIcon";
import { RLAvatar } from "../avatar/RLAvatar";

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

export const RLButton: Component<RLButtonProps> = (allProps) => {
  const props = allProps;
  const [autoLoading, setAutoLoading] = createSignal(false);

  const rest = omit(
    allProps,
    "as",
    "variant",
    "color",
    "size",
    "href",
    "to",
    "label",
    "leadingIcon",
    "trailingIcon",
    "leading-icon" as any,
    "trailing-icon" as any,
    "icon",
    "avatar",
    "loading",
    "loadingAuto",
    "loadingIcon",
    "square",
    "block",
    "justify",
    "active",
    "activeColor",
    "activeVariant",
    "activeClass",
    "inactiveClass",
    "exactActiveClass",
    "fieldGroup",
    "rounded",
    "theme",
    "ui",
    "class",
    "className",
    "disabled",
    "children",
    "leading",
    "trailing",
    "leadingSlot",
    "trailingSlot",
    "onClick",
    "onKeyDown",
    "type",
    "external",
    "externalIcon",
    "noExternalIcon",
    "target",
    "rel",
    "noRel",
    "prefetch",
    "prefetchOn" as any,
    "noPrefetch" as any,
    "prefetchedClass" as any,
    "trailingSlash" as any,
    "replace" as any,
    "exact" as any,
    "exactQuery" as any,
    "exactHash" as any,
    "locale" as any,
    "viewTransition" as any,
    "raw",
    "ariaLabel",
    "aria-label" as any,
    "ariaLabelledby",
    "aria-labelledby" as any,
    "ariaCurrentValue",
  );

  const leadingIconProp = () => props.leadingIcon ?? (props as any)["leading-icon"];
  const trailingIconProp = () => props.trailingIcon ?? (props as any)["trailing-icon"];
  const leadingFlag = () => (typeof props.leading === "boolean" ? props.leading : undefined);
  const trailingFlag = () => (typeof props.trailing === "boolean" ? props.trailing : undefined);
  const iconProp = () => props.icon ?? (props as any)["icon"];

  const isLoading = () => Boolean(props.loading || autoLoading());
  const isDisabled = () => Boolean(props.disabled || isLoading());

  const href = () => props.href || (props["to"] as string | undefined);
  const isLink = () => Boolean(href());

  const linkAttrs = createMemo(() =>
    resolveLinkAttrs({
      href: href(),
      external: props.external,
      target: props.target,
      rel: props.noRel ? "" : (props.rel ?? undefined),
      prefetch: props.prefetch,
      active: props.active,
      ariaCurrentValue: props.ariaCurrentValue,
      disabled: isDisabled(),
    }),
  );

  const externalIconName = () => {
    if (!linkAttrs().isExternal || props.noExternalIcon) return undefined;
    return props.externalIcon || "externalLink";
  };

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
      return props.loadingIcon || "loaderCircle";
    }
    return leadingIconProp() || (iconProp() && trailingFlag() !== true ? iconProp() : undefined);
  };

  const trailingIconName = () => {
    if (isLoading() && isTrailingPosition()) {
      return props.loadingIcon || "loaderCircle";
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
    const directClass = props.class ?? props.className;
    if (activeCls && directClass) return `${activeCls} ${directClass}`;
    return activeCls || directClass || undefined;
  };

  const classes = createMemo<Record<string, string>>(() =>
    RLButtonTheme({
      variant:
        props.active && props.activeVariant ? props.activeVariant : (props.variant ?? "solid"),
      color: props.active && props.activeColor ? props.activeColor : (props.color ?? "primary"),
      size: props.size ?? "md",
      justify: props.justify,
      block: props.block,
      square: isSquare(),
      fieldGroup: props.fieldGroup,
      rounded: (props["rounded"] as boolean | string | undefined) ?? false,
      leading: isLeadingPosition(),
      trailing: isTrailingPosition(),
      loading: isLoading(),
      active: props.active,
      theme: props.theme,
      ui: props.ui
        ? {
            ...props.ui,
            root: props.ui.root ?? props.ui.base,
          }
        : undefined,
      class: rootClassOverride(),
    }),
  );

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
    const userHandler = props["onKeyDown"] as ((event: KeyboardEvent) => unknown) | undefined;
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

  const ariaLabel = () => props.ariaLabel ?? (props as any)["aria-label"];
  const ariaLabelledby = () => props.ariaLabelledby ?? (props as any)["aria-labelledby"];

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

  const CustomRoot = dynamic(() => (props.as ?? "div") as string);
  const isCustomRoot = () => !isLink() && Boolean(props.as) && props.as !== "button";

  const renderLeading = () => {
    if (props.leadingSlot !== undefined && props.leadingSlot !== null) {
      return props.leadingSlot;
    }
    if (props.leading !== undefined && typeof props.leading !== "boolean") {
      return props.leading as JSX.Element;
    }

    const iconName = leadingIconName();
    if (iconName) {
      return (
        <RLIcon
          name={iconName}
          size="none"
          class={classes()["leadingIcon"]}
          data-slot="leading-icon"
          aria-hidden="true"
        />
      );
    }

    if (props.avatar && !isLoading()) {
      return (
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
        <span class={classes()["label"]} data-slot="label">
          {props.label}
        </span>
      );
    }
    return null;
  };

  const renderTrailing = () => {
    if (props.trailingSlot !== undefined && props.trailingSlot !== null) {
      return props.trailingSlot;
    }
    if (props.trailing !== undefined && typeof props.trailing !== "boolean") {
      return props.trailing as JSX.Element;
    }

    const iconName = trailingIconName();
    if (iconName) {
      return (
        <RLIcon
          name={iconName}
          size="none"
          class={classes()["trailingIcon"]}
          data-slot="trailing-icon"
          aria-hidden="true"
        />
      );
    }

    return null;
  };

  const leadingNode = createMemo(() => renderLeading());
  const contentNode = createMemo(() => renderContent());
  const trailingNode = createMemo(() => renderTrailing());

  const buttonContent = () => (
    <>
      <Show when={leadingNode()}>{leadingNode()}</Show>
      <Show when={contentNode()}>{contentNode()}</Show>
      <Show when={trailingNode()}>{trailingNode()}</Show>
    </>
  );

  const externalHint = () => (
    <Show when={showExternalHint()}>
      <span class={classes()["externalHint"]} data-slot="external-hint">
        (opens in a new tab)
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
        data-astro-prefetch={linkAttrs().prefetchAttr}
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
