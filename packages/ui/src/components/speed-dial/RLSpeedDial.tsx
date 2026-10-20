import type { Component } from "solid-js";
import type { RLSpeedDialProps } from "./speed-dial.types";
import { RLSpeedDialTheme } from "./speed-dial.theme";

export const RLSpeedDial: Component<RLSpeedDialProps> = (props) => {
  const { classes, rest } = RLSpeedDialTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
