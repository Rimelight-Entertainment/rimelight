import type { RLPasswordProps } from "./password.types";
import { RLPasswordTheme } from "./password.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPassword: Component<RLPasswordProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLPasswordTheme({
      ui: props.ui,
      class: props.class,
      ...props,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
