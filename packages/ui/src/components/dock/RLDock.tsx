import type { Component } from "solid-js";
import type { RLDockProps } from "./dock.types";
import { RLDockTheme } from "./dock.theme";

export const RLDock: Component<RLDockProps> = (props) => {
  const { classes, rest } = RLDockTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
