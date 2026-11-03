import type { Component } from "solid-js";
import type { RLHoverCardProps } from "./hover-card.types";
import { RLHoverCardTheme } from "./hover-card.theme";
import { createControllable } from "../../controllable";

const OMIT_KEYS = ["triggerLabel", "placement", "open", "defaultOpen", "onOpenChange"] as const;

export const RLHoverCard: Component<RLHoverCardProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLHoverCardTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["triggerSlot"] as const,
  });

  const [isOpen, setOpen] = createControllable(
    () => props.open,
    props.defaultOpen ?? false,
    props.onOpenChange,
  );

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      data-placement={props.placement ?? "bottom"}
      class={classes().root}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...rest}
    >
      <div
        class={classes().trigger}
        data-slot="trigger"
        tabindex={0}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {slots.triggerSlot() ? (
          slots.triggerSlot()
        ) : props.triggerLabel ? (
          <span class="cursor-help underline decoration-dotted">{props.triggerLabel}</span>
        ) : null}
      </div>

      <div class={classes().content} data-slot="content" data-state={isOpen() ? "open" : "closed"}>
        {children()}
      </div>
    </Tag>
  );
};
