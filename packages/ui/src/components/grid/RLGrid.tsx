import type { Component } from "solid-js";
import type { RLGridProps } from "./grid.types";
import { RLGridTheme } from "./grid.theme";

export const RLGrid: Component<RLGridProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLGridTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
