import type { Component } from "solid-js";
import type { RLFloatingActionProps } from "./floating-action.types";
import { RLFloatingActionTheme } from "./floating-action.theme";

export const RLFloatingAction: Component<RLFloatingActionProps> = (props) => {
  const { classes, rest } = RLFloatingActionTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
