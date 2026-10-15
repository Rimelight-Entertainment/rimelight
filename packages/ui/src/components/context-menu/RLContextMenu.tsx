import type { RLContextMenuProps } from "./context-menu.types";
import { RLContextMenuTheme } from "./context-menu.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLContextMenu: Component<RLContextMenuProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLContextMenuTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
