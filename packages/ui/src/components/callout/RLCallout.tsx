import type { RLCalloutProps } from "./callout.types";
import { RLCalloutTheme } from "./callout.theme";
import { For, Show, type Component } from "solid-js";
import { createControllable } from "../../controllable";
import { renderSlot } from "../../slot";
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
    variants: (s) => ({
      hasTitle: props.title !== undefined || s.titleSlot() !== undefined,
    }),
  });

  const [isOpen, setOpen] = createControllable(
    () => props.open,
    props.defaultOpen ?? true,
    props.onOpenChange,
  );

  const hasTitle = () => props.title !== undefined || slots.titleSlot() !== undefined;
  const hasDescription = () =>
    props.description !== undefined ||
    slots.descriptionSlot() !== undefined ||
    children() !== undefined;
  const hasActions = () =>
    slots.actionsSlot() !== undefined || (props.actions !== undefined && props.actions.length > 0);
  const hasLeading = () =>
    slots.iconSlot() !== undefined ||
    slots.avatarSlot() !== undefined ||
    props.avatar !== undefined ||
    props.icon !== undefined;
  const hasClose = () => slots.closeSlot() !== undefined || (props.dismissible ?? true);

  const titleId = () => `${id()}-title`;
  const descriptionId = () => `${id()}-description`;

  const handleDismiss = (e?: MouseEvent) => {
    e?.stopPropagation();
    setOpen(false);
    props.onDismiss?.();
  };

  const renderActions = () => (
    <Show
      when={slots.actionsSlot()}
      fallback={
        <For each={props.actions}>
          {(action) => <RLButton size="xs" color={props.color} {...action} />}
        </For>
      }
    >
      {renderSlot(slots.actionsSlot())}
    </Show>
  );

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
        aria-label={hasTitle() ? undefined : props["aria-label"]}
        class={classes().root}
        {...rest}
      >
        <Show when={hasLeading()}>
          <Show
            when={slots.iconSlot()}
            fallback={
              <Show
                when={slots.avatarSlot()}
                fallback={
                  <Show
                    when={props.avatar}
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
                    {(avatar) => {
                      const avatarValue = avatar();
                      return (
                        <RLAvatar
                          {...(typeof avatarValue === "string"
                            ? { src: avatarValue }
                            : avatarValue)}
                          size="xl"
                          class={classes().avatar}
                          data-slot="avatar"
                        />
                      );
                    }}
                  </Show>
                }
              >
                {renderSlot(slots.avatarSlot())}
              </Show>
            }
          >
            <span class={classes().icon} data-slot="icon" aria-hidden="true">
              {renderSlot(slots.iconSlot())}
            </span>
          </Show>
        </Show>

        <div class={classes().wrapper} data-slot="wrapper">
          <Show when={hasTitle()}>
            <div id={titleId()} class={classes().title} data-slot="title">
              <Show when={slots.titleSlot()} fallback={props.title}>
                {renderSlot(slots.titleSlot())}
              </Show>
            </div>
          </Show>

          <Show when={slots.headerSlot()}>
            <div class={classes().header} data-slot="header">
              {renderSlot(slots.headerSlot())}
            </div>
          </Show>

          <Show when={hasDescription()}>
            <div id={descriptionId()} class={classes().description} data-slot="description">
              <Show
                when={slots.descriptionSlot()}
                fallback={
                  <Show when={props.description} fallback={children()}>
                    {props.description}
                  </Show>
                }
              >
                {renderSlot(slots.descriptionSlot())}
              </Show>
            </div>
          </Show>

          <Show when={(props.orientation ?? "vertical") === "vertical" && hasActions()}>
            <div class={classes().actions} data-slot="actions">
              {renderActions()}
            </div>
          </Show>
        </div>

        <Show when={(props.orientation === "horizontal" && hasActions()) || hasClose()}>
          <div class={classes().actions} data-slot="actions">
            <Show when={props.orientation === "horizontal" && hasActions()}>{renderActions()}</Show>

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
                {renderSlot(slots.closeSlot())}
              </Show>
            </Show>
          </div>
        </Show>
      </Tag>
    </Show>
  );
};
