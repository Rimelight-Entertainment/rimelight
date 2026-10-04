import { createMemo, omit, type Component } from "solid-js";
import type { RLCompareProps } from "./compare";
import { compareTheme } from "./compare.theme";

export const RLCompare: Component<RLCompareProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const classes = createMemo(() =>
    compareTheme({
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
