import type { RLPageAsideProps } from "./page-aside.types";
import { RLPageAsideTheme } from "./page-aside.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPageAside: Component<RLPageAsideProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() => RLPageAsideTheme({ ui: props.ui, class: props.class }));

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
