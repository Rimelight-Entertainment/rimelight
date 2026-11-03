import type { Component } from "solid-js";
import type { RLChatPaletteProps } from "./chat-palette.types";
import { RLChatPaletteTheme } from "./chat-palette.theme";

export const RLChatPalette: Component<RLChatPaletteProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatPaletteTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
