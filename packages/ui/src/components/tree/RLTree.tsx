import type { RLTreeProps } from "./tree.types";
import { RLTreeTheme } from "./tree.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLTree: Component<RLTreeProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLTreeTheme({
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
