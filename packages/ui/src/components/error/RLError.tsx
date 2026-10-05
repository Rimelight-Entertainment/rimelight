import type { RLErrorProps } from "./error.types";
import { RLErrorTheme } from "./error.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLError: Component<RLErrorProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

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
