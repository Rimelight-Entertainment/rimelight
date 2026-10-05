import type { RLTooltipProps } from "./tooltip.types";
import { RLTooltipTheme } from "./tooltip.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLTooltip: Component<RLTooltipProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "content", "placement", "ui", "class", "children", "contentSlot");

  const placement = () => props.placement ?? "top";

  const resolvedClasses = createMemo(() =>
    RLTooltipTheme({
      placement: placement(),
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div
      class={resolvedClasses().root}
      data-slot="tooltip-container"
      data-placement={placement()}
      {...rest}
    >
      <div class={resolvedClasses().trigger} data-slot="trigger" tabindex={0}>
        {props.children}
      </div>

      <div class={resolvedClasses().content} data-slot="content" role="tooltip">
        {props.contentSlot !== undefined ? props.contentSlot : props.content}
      </div>
    </div>
  );
};
