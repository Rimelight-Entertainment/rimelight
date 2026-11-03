import type { RLCalloutProps } from "./callout.types";
import { RLCalloutTheme } from "./callout.theme";
import { For, Show, type Component } from "solid-js";
import { createControllable } from "../../controllable";
import { uiT } from "../../locale";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = [
  "title",
  "description",
  "icon",
  "avatar",
  "actions",
  "dismissible",
  "closeIcon",
  "open",
  "defaultOpen",
  "onOpenChange",
  "onDismiss",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
] as const;

export const RLCallout: Component<RLCalloutProps> = (props) => {
  const { Tag, classes, rest, id, slots, children, theme } = RLCalloutTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: [
      "iconSlot",
      "titleSlot",
      "descriptionSlot",
      "headerSlot",
      "avatarSlot",
      "closeSlot",
      "actionsSlot",
    ] as const,
    variants: (s) => ({ title: props.title !== undefined || s.titleSlot() !== undefined }),
  });

  const [isOpen, setOpen] = createControllable(
    () => props.open,
    props.defaultOpen ?? true,
    props.onOpenChange,
  );

  const hasTitle = () => Boolean(props.title !== undefined || slots.titleSlot() !== undefined);
  const hasDescription = () =>
    Boolean(
      props.description !== undefined ||
      slots.descriptionSlot() !== undefined ||
      children() !== undefined,
    );
  const hasActions = () =>
    Boolean(slots.actionsSlot() !== undefined || (props.actions && props.actions.length > 0));
  const hasLeading = () =>
    Boolean(
      slots.iconSlot() !== undefined ||
      slots.avatarSlot() !== undefined ||
      props.avatar !== undefined ||
      props.icon !== undefined,
    );
  const isDismissible = () => props.dismissible ?? true;
  const hasClose = () => Boolean(slots.closeSlot() !== undefined || isDismissible());

  const titleId = () => `${id()}-title`;
  const descriptionId = () => `${id()}-description`;

  const handleDismiss = (e?: MouseEvent) => {
    e?.stopPropagation();
    setOpen(false);
    props.onDismiss?.();
  };

  return (
    <Show when={isOpen()}>
      <Tag
        id={id()}
        data-slot="root"
        data-theme={theme()}
        data-orientation={props.orientation ?? "vertical"}
        role="alert"
        aria-labelledby={hasTitle() ? titleId() : props["aria-labelledby"]}
        aria-describedby={hasDescription() ? descriptionId() : props["aria-describedby"]}
        aria-label={!hasTitle() ? props["aria-label"] : undefined}
        class={classes().root}
        {...rest}
      >
        {/* Leading Icon / Avatar / Slot */}
        <Show when={hasLeading()}>
          <Show
            when={slots.iconSlot()}
            fallback={
              <Show
                when={slots.avatarSlot() !== undefined ? slots.avatarSlot() : props.avatar}
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
                  when={slots.avatarSlot()}
                  fallback={
                    <RLAvatar
                      {...(typeof props.avatar === "string" ? { src: props.avatar } : props.avatar)}
                      size="xl"
                      class={classes().avatar}
                      data-slot="avatar"
                    />
                  }
                >
                  {slots.avatarSlot()}
                </Show>
              </Show>
            }
          >
            {slots.iconSlot()}
          </Show>
        </Show>

        {/* Body / Content Wrapper */}
        <div class={classes().wrapper} data-slot="wrapper">
          <Show when={hasTitle()}>
            <div id={titleId()} class={classes().title} data-slot="title">
              {slots.titleSlot() ?? props.title}
            </div>
          </Show>

          {slots.headerSlot()}

          <Show when={hasDescription()}>
            <div id={descriptionId()} class={classes().description} data-slot="description">
              {slots.descriptionSlot() ?? props.description ?? children()}
            </div>
          </Show>

          {/* Vertical Actions */}
          <Show when={(props.orientation ?? "vertical") === "vertical" && hasActions()}>
            <div class={classes().actions} data-slot="actions">
              <Show
                when={slots.actionsSlot()}
                fallback={
                  <For each={props.actions}>
                    {(action) => <RLButton size="xs" color={props.color} {...action} />}
                  </For>
                }
              >
                {slots.actionsSlot()}
              </Show>
            </div>
          </Show>
        </div>

        {/* Trailing Horizontal Actions & Close Button */}
        <Show when={(props.orientation === "horizontal" && hasActions()) || hasClose()}>
          <div class={classes().actions} data-slot="actions">
            <Show when={props.orientation === "horizontal" && hasActions()}>
              <Show
                when={slots.actionsSlot()}
                fallback={
                  <For each={props.actions}>
                    {(action) => <RLButton size="xs" color={props.color} {...action} />}
                  </For>
                }
              >
                {slots.actionsSlot()}
              </Show>
            </Show>

            <Show when={hasClose()}>
              <Show
                when={slots.closeSlot()}
                fallback={
                  <RLButton
                    type="button"
                    size="md"
                    color="neutral"
                    variant="link"
                    leadingIcon={props.closeIcon ?? "x"}
                    aria-label={uiT("callout.close")}
                    class={classes().close}
                    data-slot="close"
                    onClick={handleDismiss}
                  />
                }
              >
                {slots.closeSlot()}
              </Show>
            </Show>
          </div>
        </Show>
      </Tag>
    </Show>
  );
};
