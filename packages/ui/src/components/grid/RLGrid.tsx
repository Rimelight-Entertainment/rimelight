import type { RLGridProps } from "./grid.types";
import { RLGridTheme } from "./grid.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLGrid: Component<RLGridProps> = (props) => {
  const rest = omit(props, "cols", "stagger", "gap", "ui", "class", "children");

  const classes = createMemo(() =>
    RLGridTheme({
      cols: props.cols ?? 2,
      gap: props.gap ?? "md",
      stagger: props.stagger ?? false,
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes().root} {...rest}>
      {props.children}
    </div>
  );
};
