import type { RLDockProps } from "./dock.types";
import { RLDockTheme } from "./dock.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLDock: Component<RLDockProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLDockTheme({
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
