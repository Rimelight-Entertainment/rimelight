import { createMemo, createSignal, Show, type Component } from "solid-js";
import { dynamic, type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { ButtonProps } from "./button";
import { buttonTheme } from "./button.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLAvatar } from "../avatar/RLAvatar";

export interface RLButtonProps extends ButtonProps {}

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
    "type",
    "external",
    "externalIcon",
    "noExternalIcon",
    "target",
    "rel",
    "noRel",
    "prefetch",
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

  const href = () => props.href || (props["to"] as string | undefined);
  const isLink = () => Boolean(href());

  const isTrailingPosition = () =>
    Boolean(
      props.trailingSlot ||
      (props.trailing !== undefined && typeof props.trailing !== "boolean") ||
      trailingIconProp() ||
      (iconProp() && trailingFlag() === true) ||
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
    return trailingIconProp() || (iconProp() && trailingFlag() === true ? iconProp() : undefined);
  };

  const isSquare = () =>
    props.square !== undefined
      ? Boolean(props.square)
      : !props.label && !props.children && Boolean(isLeadingPosition() || isTrailingPosition());

  const rootClassOverride = () => {
    const activeCls = props.active ? props.activeClass : props.inactiveClass;
    const directClass = props.class ?? props.className;
    if (activeCls && directClass) return `${activeCls} ${directClass}`;
    return activeCls || directClass || undefined;
  };

  const classes = createMemo<Record<string, string>>(() =>
    buttonTheme({
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
    if (props.disabled || isLoading()) {
      e.preventDefault();
      return;
    }
    if (props.onClick) {
      const result = props.onClick(e);
      if (props.loadingAuto && result && typeof (result as any).then === "function") {
        setAutoLoading(true);
        void (result as Promise<unknown>).finally(() => {
          setAutoLoading(false);
        });
      }
    }
  };

  const ariaLabel = () => props.ariaLabel ?? (props as any)["aria-label"];
  const ariaLabelledby = () => props.ariaLabelledby ?? (props as any)["aria-labelledby"];

  const isExternal = () =>
    Boolean(
      props.external ||
      (href() && /^(?:https?:)?\/\//.test(href()!)) ||
      (props.target && props.target !== "_self"),
    );

  const targetValue = () => props.target || (isExternal() ? "_blank" : undefined);

  const relValue = () =>
    props.rel !== undefined
      ? props.rel || undefined
      : props.noRel
        ? undefined
        : isExternal()
          ? "noopener noreferrer"
          : undefined;

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
              disabled={props.disabled || isLoading()}
              aria-disabled={props.disabled || isLoading() ? "true" : undefined}
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
            disabled={props.disabled || isLoading()}
            aria-disabled={props.disabled || isLoading() ? "true" : undefined}
            tabindex={props.disabled ? -1 : 0}
            role="button"
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
          </CustomRoot>
        </Show>
      }
    >
      <a
        href={props.disabled || isLoading() ? undefined : href()}
        target={targetValue()}
        rel={relValue()}
        aria-disabled={props.disabled || isLoading() ? "true" : undefined}
        aria-current={props.active ? (props.ariaCurrentValue ?? "page") : undefined}
        tabindex={props.disabled || isLoading() ? -1 : undefined}
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
      </a>
    </Show>
  );
};
