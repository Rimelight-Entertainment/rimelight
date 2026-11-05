import type { Component } from "solid-js";
import type { RLChatPaletteProps } from "./chat-palette.types";
import { RLChatPaletteTheme } from "./chat-palette.theme";
import { uiT } from "../../locale";

const OMIT_KEYS = ["aria-label"] as const;

export const RLChatPalette: Component<RLChatPaletteProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLChatPaletteTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      role="group"
      aria-label={props["aria-label"] ?? uiT("chat-palette.label")}
      class={classes().root}
      {...rest}
    >
      {children()}
    </Tag>
  );
};
