import type { RLPageProps } from "./page.types";
import { RLPageTheme } from "./page.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPage: Component<RLPageProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() => RLPageTheme({ ui: props.ui, class: props.class }));

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
