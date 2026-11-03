import { Show, type Component } from "solid-js";
import type { RLChipProps } from "./chip.types";
import { RLChipTheme } from "./chip.theme";

const OMIT_KEYS = ["text", "show", "textSlot"] as const;

export const RLChip: Component<RLChipProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLChipTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["textSlot"] as const,
  });

  const renderContent = () => {
    const custom = slots.textSlot();
    if (custom !== undefined && custom !== null) return custom;
    if (props.text !== undefined && props.text !== null) return props.text;
    return null;
  };

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
      <Show when={props.show ?? true}>
        <span class={classes().base} data-slot="base">
          {renderContent()}
        </span>
      </Show>
    </Tag>
  );
};
