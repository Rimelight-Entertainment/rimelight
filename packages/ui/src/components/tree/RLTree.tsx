import type { Component } from "solid-js";
import type { RLTreeProps } from "./tree.types";
import { RLTreeTheme } from "./tree.theme";

export const RLTree: Component<RLTreeProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLTreeTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
