import type { Component } from "solid-js";
import type { RLGridProps } from "./grid.types";
import { RLGridTheme } from "./grid.theme";

export const RLGrid: Component<RLGridProps> = (props) => {
  const { classes, rest } = RLGridTheme.setup(props);

  return (
    <div class={classes().root} {...rest}>
      {props.children}
    </div>
  );
};
