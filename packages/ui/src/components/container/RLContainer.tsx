import type { Component } from "solid-js";
import type { RLContainerProps } from "./container.types";
import { RLContainerTheme } from "./container.theme";

export const RLContainer: Component<RLContainerProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLContainerTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
