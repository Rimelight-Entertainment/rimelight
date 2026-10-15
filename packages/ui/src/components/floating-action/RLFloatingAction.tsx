import type { RLFloatingActionProps } from "./floating-action.types";
import { RLFloatingActionTheme } from "./floating-action.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLFloatingAction: Component<RLFloatingActionProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLFloatingActionTheme({
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
