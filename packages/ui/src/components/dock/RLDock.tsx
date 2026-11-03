import type { Component } from "solid-js";
import type { RLDockProps } from "./dock.types";
import { RLDockTheme } from "./dock.theme";

export const RLDock: Component<RLDockProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLDockTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
