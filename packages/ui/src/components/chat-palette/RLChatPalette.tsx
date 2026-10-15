import type { RLChatPaletteProps } from "./chat-palette.types";
import { RLChatPaletteTheme } from "./chat-palette.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatPalette: Component<RLChatPaletteProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLChatPaletteTheme({
      ui: props.ui,
      class: props.class,
      ...props,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
