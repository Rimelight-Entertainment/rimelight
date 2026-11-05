import type { Component } from "solid-js";
import type { RLFloatingActionProps } from "./floating-action.types";
import { RLFloatingActionTheme } from "./floating-action.theme";

export const RLFloatingAction: Component<RLFloatingActionProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLFloatingActionTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
