import { Show, type Component } from "solid-js";
import type { RLHoverCardProps } from "./hover-card.types";
import { RLHoverCardTheme } from "./hover-card.theme";
import { createControllable } from "../../controllable";
import { renderSlot } from "../../slot";

const OMIT_KEYS = ["triggerLabel", "side", "open", "defaultOpen", "onOpenChange"] as const;

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
      data-side={props.side ?? "bottom"}
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
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <Show
          when={slots.triggerSlot()}
          fallback={
            <Show when={props.triggerLabel}>
              <span data-slot="label" class={classes().label}>
                {props.triggerLabel}
              </span>
            </Show>
          }
        >
          {(trigger) => renderSlot(trigger())}
        </Show>
      </div>

      <div class={classes().body} data-slot="body" data-state={isOpen() ? "open" : "closed"}>
        {children()}
      </div>
    </Tag>
  );
};
