import type { RLTooltipProps } from "./tooltip.types";
import { RLTooltipTheme } from "./tooltip.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLTooltip: Component<RLTooltipProps> = (props) => {
  const rest = omit(props, "content", "placement", "ui", "class", "children", "contentSlot");

  const placement = () => props.placement ?? "top";

  const classes = createMemo(() =>
    RLTooltipTheme({
      placement: placement(),
      ui: props.ui,
      class: props.class,
    }),
  );

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
