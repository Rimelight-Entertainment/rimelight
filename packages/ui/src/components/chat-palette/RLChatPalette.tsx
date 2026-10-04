import { createMemo, omit, type Component } from "solid-js";
import type { RLChatPaletteProps } from "./chat-palette";
import { chatPaletteTheme } from "./chat-palette.theme";

export const RLChatPalette: Component<RLChatPaletteProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    chatPaletteTheme({
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
