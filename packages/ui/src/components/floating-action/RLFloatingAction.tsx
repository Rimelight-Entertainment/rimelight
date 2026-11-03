import type { Component } from "solid-js";
import type { RLFloatingActionProps } from "./floating-action.types";
import { RLFloatingActionTheme } from "./floating-action.theme";

export const RLFloatingAction: Component<RLFloatingActionProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLFloatingActionTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
