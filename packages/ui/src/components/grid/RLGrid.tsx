import type { Component } from "solid-js";
import type { RLGridProps } from "./grid.types";
import { RLGridTheme } from "./grid.theme";

const OMIT_KEYS = ["cols", "gap", "stagger"] as const;

export const RLGrid: Component<RLGridProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLGridTheme.setup(props, { omit: OMIT_KEYS });

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
