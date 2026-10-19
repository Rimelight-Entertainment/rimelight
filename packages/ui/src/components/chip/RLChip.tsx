import { Show, type Component } from "solid-js";
import type { RLChipProps } from "./chip.types";
import { RLChipTheme } from "./chip.theme";

const OMIT_KEYS = ["text", "show", "content", "contentSlot"] as const;

export const RLChip: Component<RLChipProps> = (props) => {
  const { Tag: Root, classes, rest } = RLChipTheme.setup(props, { omit: OMIT_KEYS });

  const isVisible = () => props.show ?? true;

  const renderContent = () => {
    if (props.contentSlot !== undefined && props.contentSlot !== null) {
      return props.contentSlot;
    }
    if (props.content !== undefined && props.content !== null) {
      return props.content;
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
