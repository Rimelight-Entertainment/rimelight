import type { RLErrorProps } from "./error.types";
import { RLErrorTheme } from "./error.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLError: Component<RLErrorProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLErrorTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes()["root"]} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
