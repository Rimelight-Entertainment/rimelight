import type { RLPageHeaderProps } from "./page-header.types";
import { RLPageHeaderTheme } from "./page-header.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPageHeader: Component<RLPageHeaderProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() => RLPageHeaderTheme({ ui: props.ui, class: props.class }));

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
