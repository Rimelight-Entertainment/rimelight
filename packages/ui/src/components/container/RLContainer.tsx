import type { Component } from "solid-js";
import type { RLContainerProps } from "./container.types";
import { RLContainerTheme } from "./container.theme";

export const RLContainer: Component<RLContainerProps> = (props) => {
  const { Tag, classes, rest } = RLContainerTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </Tag>
  );
};
