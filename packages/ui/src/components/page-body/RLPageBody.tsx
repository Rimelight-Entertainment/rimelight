import type { Component } from "solid-js";
import type { RLPageBodyProps } from "./page-body.types";
import { RLPageBodyTheme } from "./page-body.theme";

export const RLPageBody: Component<RLPageBodyProps> = (props) => {
  const { classes, rest } = RLPageBodyTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
