import { Show, type Component } from "solid-js";
import type { RLChipProps } from "./chip.types";
import { RLChipTheme } from "./chip.theme";
import { renderSlot } from "../../slot";

const OMIT_KEYS = ["text", "show", "labelSlot"] as const;

export const RLChip: Component<RLChipProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLChipTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["labelSlot"] as const,
  });

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
      <Show when={props.show ?? true}>
        <span class={classes().base} data-slot="base">
          <span class={classes().label} data-slot="label">
            <Show when={slots.labelSlot()} fallback={props.text}>
              {renderSlot(slots.labelSlot())}
            </Show>
          </span>
        </span>
      </Show>
    </Tag>
  );
};
