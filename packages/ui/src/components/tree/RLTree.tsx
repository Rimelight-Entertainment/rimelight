import type { Component } from "solid-js";
import type { RLTreeProps } from "./tree.types";
import { RLTreeTheme } from "./tree.theme";

export const RLTree: Component<RLTreeProps> = (props) => {
  const { classes, rest } = RLTreeTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
