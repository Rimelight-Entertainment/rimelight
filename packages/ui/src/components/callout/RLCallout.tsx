import {
  createComponent,
  createMemo,
  createSignal,
  createUniqueId,
  omit,
  For,
  Show,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import type { RLCalloutProps } from "./callout.types";
import { calloutTheme } from "./callout.theme";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";
import type { RLButtonProps } from "../button/button.types";

export const RLCallout: Component<RLCalloutProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "as",
    "variant",
    "color",
    "orientation",
    "title",
    "description",
    "icon",
    "avatar",
    "actions",
    "close",
    "closeIcon",
    "open",
    "defaultOpen",
    "onClose",
    "onOpenChange",
    "onUpdateOpen",
    "theme",
    "ui",
    "class",
    "id",
    "ariaLabel",
    "ariaLabelledby",
    "ariaDescribedby",
    "children",
    "leading",
    "iconSlot",
    "titleSlot",
    "descriptionSlot",
    "headerSlot",
    "avatarSlot",
    "closeSlot",
    "actionsSlot",
  );

  const [internalOpen, setInternalOpen] = createSignal(props.defaultOpen ?? true);
  const isOpen = () => (props.open !== undefined ? props.open : internalOpen());

  const calloutId = props.id || `rl-callout-${createUniqueId()}`;
  const titleId = `${calloutId}-title`;
  const descriptionId = `${calloutId}-description`;

  const hasTitle = () => Boolean(props.title !== undefined || props.titleSlot !== undefined);
  const hasDescription = () =>
    Boolean(
      props.description !== undefined ||
      props.descriptionSlot !== undefined ||
      props.children !== undefined,
    );
  const hasActions = () =>
    Boolean(props.actionsSlot !== undefined || (props.actions && props.actions.length > 0));
  const hasLeading = () =>
    Boolean(
      props.leading !== undefined ||
      props.iconSlot !== undefined ||
      props.avatarSlot !== undefined ||
      props.avatar !== undefined ||
      props.icon !== undefined,
    );
  const hasClose = () => Boolean(props.closeSlot !== undefined || props.close);

  const classes = createMemo(() =>
    calloutTheme({
      variant: props.variant ?? "solid",
      color: props.color ?? "primary",
      orientation: props.orientation ?? "vertical",
      title: hasTitle(),
      theme: props.theme,
      ui: props.ui,
      class: props.class,
    }),
  );

  const handleClose = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (props.open === undefined) {
      setInternalOpen(false);
    }
    props.onClose?.();
    props.onUpdateOpen?.(false);
    props.onOpenChange?.(false);
  };

  const closeButtonProps = createMemo((): RLButtonProps => {
    const base: RLButtonProps = {
      size: "md",
      color: "neutral",
      variant: "link",
      leadingIcon: props.closeIcon || "close",
      ariaLabel: "Close",
    };
    return typeof props.close === "object" && props.close !== null
      ? { ...base, ...props.close }
      : base;
  });

  const renderRoot = (content: JSX.Element) => {
    const rootProps = {
      id: calloutId,
      "data-slot": "root",
      "data-orientation": props.orientation ?? "vertical",
      role: "alert" as const,
      "aria-labelledby": hasTitle() ? titleId : props.ariaLabelledby,
      "aria-describedby": hasDescription() ? descriptionId : props.ariaDescribedby,
      "aria-label": !hasTitle() ? props.ariaLabel : undefined,
      class: classes().root,
      "data-theme": props.theme,
      ...rest,
    };

    if (props.as === "section") {
      return <section {...rootProps}>{content}</section>;
    }
    if (props.as === "aside") {
      return <aside {...rootProps}>{content}</aside>;
    }
    if (typeof props.as === "function") {
      return createComponent(props.as as any, { ...rootProps, children: content });
    }
    return <div {...rootProps}>{content}</div>;
  };

  return (
    <Show when={isOpen()}>
      {renderRoot(
        <>
          {/* Leading Icon / Avatar / Slot */}
          <Show when={hasLeading()}>
            <Show
              when={props.leading ?? props.iconSlot}
              fallback={
                <Show
                  when={props.avatarSlot !== undefined ? props.avatarSlot : props.avatar}
                  fallback={
                    <Show when={props.icon}>
                      {(icon) => (
                        <span class={classes().icon} data-slot="icon" aria-hidden="true">
                          <RLIcon name={icon()} aria-hidden="true" />
                        </span>
                      )}
                    </Show>
                  }
                >
                  <Show
                    when={props.avatarSlot}
                    fallback={
                      <RLAvatar
                        {...(typeof props.avatar === "string"
                          ? { src: props.avatar }
                          : props.avatar)}
                        size={classes().avatarSize as any}
                        class={classes().avatar}
                        data-slot="avatar"
                      />
                    }
                  >
                    {props.avatarSlot}
                  </Show>
                </Show>
              }
            >
              {props.leading ?? props.iconSlot}
            </Show>
          </Show>

          {/* Body / Content Wrapper */}
          <div class={classes().wrapper} data-slot="wrapper">
            <Show when={hasTitle()}>
              <div id={titleId} class={classes().title} data-slot="title">
                {props.titleSlot ?? props.title}
              </div>
            </Show>

            {props.headerSlot}

            <Show when={hasDescription()}>
              <div id={descriptionId} class={classes().description} data-slot="description">
                {props.descriptionSlot ?? props.description ?? props.children}
              </div>
            </Show>

            {/* Vertical Actions */}
            <Show when={(props.orientation ?? "vertical") === "vertical" && hasActions()}>
              <div class={classes().actions} data-slot="actions">
                <Show
                  when={props.actionsSlot}
                  fallback={
                    <For each={props.actions}>
                      {(action) => (
                        <RLButton size="xs" color={props.color ?? "primary"} {...action} />
                      )}
                    </For>
                  }
                >
                  {props.actionsSlot}
                </Show>
              </div>
            </Show>
          </div>

          {/* Trailing Horizontal Actions & Close Button */}
          <Show when={(props.orientation === "horizontal" && hasActions()) || hasClose()}>
            <div class={classes().actions} data-slot="actions">
              <Show when={props.orientation === "horizontal" && hasActions()}>
                <Show
                  when={props.actionsSlot}
                  fallback={
                    <For each={props.actions}>
                      {(action) => (
                        <RLButton size="xs" color={props.color ?? "primary"} {...action} />
                      )}
                    </For>
                  }
                >
                  {props.actionsSlot}
                </Show>
              </Show>

              <Show when={hasClose()}>
                <Show
                  when={props.closeSlot}
                  fallback={
                    <RLButton
                      type="button"
                      class={classes().close}
                      data-slot="close"
                      onClick={handleClose}
                      {...closeButtonProps()}
                    />
                  }
                >
                  {props.closeSlot}
                </Show>
              </Show>
            </div>
          </Show>
        </>,
      )}
    </Show>
  );
};
