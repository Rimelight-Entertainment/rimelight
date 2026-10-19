import type { RLCalloutProps } from "./callout.types";
import { RLCalloutTheme } from "./callout.theme";
import { createMemo, createSignal, For, Show, untrack, type Component } from "solid-js";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";
import type { RLButtonProps } from "../button/button.types";

const OMIT_KEYS = [
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
  "id",
  "ariaLabel",
  "ariaLabelledby",
  "ariaDescribedby",
  "leading",
  "iconSlot",
  "titleSlot",
  "descriptionSlot",
  "headerSlot",
  "avatarSlot",
  "closeSlot",
  "actionsSlot",
] as const;

export const RLCallout: Component<RLCalloutProps> = (props) => {
  const [internalOpen, setInternalOpen] = createSignal(untrack(() => props.defaultOpen ?? true));
  const isOpen = () => (props.open !== undefined ? props.open : internalOpen());

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

  const {
    Tag: Root,
    classes,
    rest,
    id: calloutId,
  } = RLCalloutTheme.setup(props, {
    omit: OMIT_KEYS,
    variants: () => ({ title: hasTitle() }),
  });

  const titleId = () => `${calloutId()}-title`;
  const descriptionId = () => `${calloutId()}-description`;

  const handleClose = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (props.open === undefined) {
      setInternalOpen(false);
    }
    props.onClose?.();
    props.onOpenChange?.(false);
  };

  const closeButtonProps = createMemo((): RLButtonProps => {
    const base: RLButtonProps = {
      size: "md",
      color: "neutral",
      variant: "link",
      leadingIcon: props.closeIcon || "x",
      ariaLabel: "Close",
    };
    return typeof props.close === "object" && props.close !== null
      ? { ...base, ...props.close }
      : base;
  });

  const rootProps = () => ({
    id: calloutId(),
    "data-slot": "root",
    "data-orientation": props.orientation ?? "vertical",
    role: "alert" as const,
    "aria-labelledby": hasTitle() ? titleId() : props.ariaLabelledby,
    "aria-describedby": hasDescription() ? descriptionId() : props.ariaDescribedby,
    "aria-label": !hasTitle() ? props.ariaLabel : undefined,
    class: classes().root,
    "data-theme": props.theme,
    ...rest,
  });

  return (
    <Show when={isOpen()}>
      <Root {...rootProps()}>
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
              <div id={titleId()} class={classes().title} data-slot="title">
                {props.titleSlot ?? props.title}
              </div>
            </Show>

            {props.headerSlot}

            <Show when={hasDescription()}>
              <div id={descriptionId()} class={classes().description} data-slot="description">
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
        </>
      </Root>
    </Show>
  );
};
