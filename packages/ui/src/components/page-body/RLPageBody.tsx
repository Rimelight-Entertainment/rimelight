import type { Component } from "solid-js";
import type { RLPageBodyProps } from "./page-body.types";
import { RLPageBodyTheme } from "./page-body.theme";

export const RLPageBody: Component<RLPageBodyProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLPageBodyTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
