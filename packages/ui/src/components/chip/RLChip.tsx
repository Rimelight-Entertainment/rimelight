import { Show, type Component } from "solid-js";
import type { RLChipProps } from "./chip.types";
import { RLChipTheme } from "./chip.theme";

const OMIT_KEYS = ["text", "show", "content"] as const;

export const RLChip: Component<RLChipProps> = (props) => {
  const {
    Tag: Root,
    classes,
    rest,
    slots,
  } = RLChipTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["contentSlot"] as const,
  });

  const isVisible = () => props.show ?? true;

  const renderContent = () => {
    if (slots.contentSlot() !== undefined && slots.contentSlot() !== null) {
      return slots.contentSlot();
    }
    if (props.text !== undefined && props.text !== null) {
      return props.text;
    }
    return null;
  };

  return (
    <Root class={classes().root} data-slot="root" data-theme={props.theme} {...rest}>
      {props.children}
      <Show when={isVisible()}>
        <span class={classes().base} data-slot="base">
          {renderContent()}
        </span>
      </Show>
    </Root>
  );
};
