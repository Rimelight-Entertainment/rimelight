import type { Component } from "solid-js";
import type { RLChatPaletteProps } from "./chat-palette.types";
import { RLChatPaletteTheme } from "./chat-palette.theme";

export const RLChatPalette: Component<RLChatPaletteProps> = (props) => {
  const { classes, rest } = RLChatPaletteTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
