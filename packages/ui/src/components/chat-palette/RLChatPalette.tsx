import type { RLChatPaletteProps } from "./chat-palette.types";
import { RLChatPaletteTheme } from "./chat-palette.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLChatPalette: Component<RLChatPaletteProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLChatPaletteTheme({
      ui: props.ui,
      class: props.class,
      ...allProps,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
