import { createMemo, omit, type Component } from "solid-js";
import type { RLErrorProps } from "./error.types";
import { errorTheme } from "./error.theme";

export const RLError: Component<RLErrorProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const classes = createMemo(() =>
    errorTheme({
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
