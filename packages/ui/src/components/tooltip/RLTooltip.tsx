import type { Component } from "solid-js";
import type { RLTooltipProps } from "./tooltip.types";
import { RLTooltipTheme } from "./tooltip.theme";

const OMIT_KEYS = ["content", "contentSlot"] as const;

export const RLTooltip: Component<RLTooltipProps> = (props) => {
  const placement = () => props.placement ?? "top";

  const { classes, rest } = RLTooltipTheme.setup(props, {
    omit: OMIT_KEYS,
    variants: () => ({ placement: placement() }),
  });

  return (
    <div
      class={classes().root}
      data-slot="tooltip-container"
      data-placement={placement()}
      {...rest}
    >
      <div class={classes().trigger} data-slot="trigger" tabindex={0}>
        {props.children}
      </div>

      <div class={classes().content} data-slot="content" role="tooltip">
        {props.contentSlot !== undefined ? props.contentSlot : props.content}
      </div>
    </div>
  );
};
