import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { RLTooltipProps } from "./tooltip.types";
import { RLTooltipTheme } from "./tooltip.theme";
import { createControllable } from "../../controllable";
import { renderSlot } from "../../slot";

const OMIT_KEYS = ["body", "placement", "open", "defaultOpen", "onOpenChange"] as const;

export const RLTooltip: Component<RLTooltipProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLTooltipTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["bodySlot"] as const,
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
      data-placement={props.placement ?? "top"}
      class={classes().root}
      {...rest}
    >
      <div
        class={classes().trigger}
        data-slot="trigger"
        tabindex={0}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children()}
      </div>

      <div
        class={classes().content}
        data-slot="content"
        data-state={isOpen() ? "open" : "closed"}
        role="tooltip"
      >
        <div class={classes().body} data-slot="body">
          <Show when={slots.bodySlot() !== undefined} fallback={props.body}>
            {renderSlot(slots.bodySlot())}
          </Show>
        </div>
      </div>
    </Tag>
  );
};
