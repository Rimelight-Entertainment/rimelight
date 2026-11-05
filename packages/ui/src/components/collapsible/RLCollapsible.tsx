import type { CollapsibleSlotContext, RLCollapsibleProps } from "./collapsible.types";
import { RLCollapsibleTheme } from "./collapsible.theme";
import { Show, type Component } from "solid-js";
import { renderSlot } from "../../slot";
import { createControllable } from "../../controllable";

const OMIT_KEYS = [
  "disabled",
  "defaultOpen",
  "open",
  "onOpenChange",
  "unmountOnHide",
  "triggerSlot",
  "bodySlot",
] as const;

export const RLCollapsible: Component<RLCollapsibleProps> = (props) => {
  const { Tag, classes, rest, id, slots, children, theme } = RLCollapsibleTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["triggerSlot", "bodySlot"] as const,
    variants: () => ({ disabled: props.disabled === true }),
  });

  const [isOpen, setOpen] = createControllable(
    () => props.open,
    props.defaultOpen ?? false,
    props.onOpenChange,
  );
  const unmountOnHide = () => props.unmountOnHide !== false;
  const isDisabled = () => props.disabled === true;

  const triggerId = () => `${id()}-trigger`;
  const contentId = () => `${id()}-content`;

  const handleToggle = () => {
    if (isDisabled()) return;
    setOpen(!isOpen());
  };

  const ctx = (): CollapsibleSlotContext => ({ open: isOpen() });
  const hasTriggerSlot = () => slots.triggerSlot() !== undefined;

  // `children` is the trigger, or the content when `triggerSlot` is set.
  const triggerContent = () => {
    const trigger = slots.triggerSlot();
    return trigger === undefined ? children() : renderSlot(trigger, ctx());
  };
  const contentContent = () => {
    const body = slots.bodySlot();
    if (body !== undefined) return renderSlot(body, ctx());
    return hasTriggerSlot() ? children() : undefined;
  };

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      data-state={isOpen() ? "open" : "closed"}
      data-disabled={isDisabled() ? "" : undefined}
      {...rest}
    >
      <Show when={triggerContent() !== undefined}>
        <div
          id={triggerId()}
          class={classes().trigger}
          data-slot="trigger"
          aria-controls={contentId()}
          aria-expanded={isOpen() ? "true" : "false"}
          data-state={isOpen() ? "open" : "closed"}
          data-disabled={isDisabled() ? "" : undefined}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              const target = e.target as HTMLElement | null;
              if (
                target &&
                target.tagName !== "BUTTON" &&
                target.tagName !== "A" &&
                target.tagName !== "INPUT"
              ) {
                e.preventDefault();
                handleToggle();
              }
            }
          }}
        >
          {triggerContent()}
        </div>
      </Show>

      <Show when={slots.bodySlot() !== undefined || children() !== undefined}>
        <Show
          when={unmountOnHide()}
          fallback={
            <div
              id={contentId()}
              class={classes().body}
              data-slot="body"
              data-state={isOpen() ? "open" : "closed"}
              data-disabled={isDisabled() ? "" : undefined}
              hidden={!isOpen() ? true : undefined}
            >
              {contentContent()}
            </div>
          }
        >
          <Show when={isOpen()}>
            <div
              id={contentId()}
              class={classes().body}
              data-slot="body"
              data-state="open"
              data-disabled={isDisabled() ? "" : undefined}
            >
              {contentContent()}
            </div>
          </Show>
        </Show>
      </Show>
    </Tag>
  );
};
