import type { RLCompareProps } from "./compare.types";
import { RLCompareTheme } from "./compare.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLCompare: Component<RLCompareProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const classes = createMemo(() =>
    RLCompareTheme({
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
