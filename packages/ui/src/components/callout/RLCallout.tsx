import type { RLCalloutProps } from "./callout.types";
import { RLCalloutTheme } from "./callout.theme";
import {
  createMemo,
  createSignal,
  createUniqueId,
  omit,
  For,
  Show,
  type Component,
  isStatic,
} from "solid-js";
import { dynamic } from "@solidjs/web";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";
import type { RLButtonProps } from "../button/button.types";

export const RLCallout: Component<RLCalloutProps> = (props) => {
  const rest = omit(
    props,
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
    RLCalloutTheme({
      variant: props.variant ?? "solid",
      color: props.color ?? "primary",
      orientation: props.orientation ?? "vertical",
      title: hasTitle(),
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

  const Root = dynamic(() => props.as ?? "div", { static: isStatic(props, "as") });

  const rootProps = () => ({
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
        </>
      </Root>
    </Show>
  );
};
