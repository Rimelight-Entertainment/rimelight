import type { Component } from "solid-js";
import type { RLContextMenuProps } from "./context-menu.types";
import { RLContextMenuTheme } from "./context-menu.theme";

export const RLContextMenu: Component<RLContextMenuProps> = (props) => {
  const { classes, rest } = RLContextMenuTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
