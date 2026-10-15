import type { RLSpeedDialProps } from "./speed-dial.types";
import { RLSpeedDialTheme } from "./speed-dial.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLSpeedDial: Component<RLSpeedDialProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLSpeedDialTheme({
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
