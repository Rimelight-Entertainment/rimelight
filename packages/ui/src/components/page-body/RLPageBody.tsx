import type { RLPageBodyProps } from "./page-body.types";
import { RLPageBodyTheme } from "./page-body.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPageBody: Component<RLPageBodyProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() => RLPageBodyTheme({ ui: props.ui, class: props.class }));

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
