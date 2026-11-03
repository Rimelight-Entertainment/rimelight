import type { Component } from "solid-js";
import type { RLSpeedDialProps } from "./speed-dial.types";
import { RLSpeedDialTheme } from "./speed-dial.theme";

export const RLSpeedDial: Component<RLSpeedDialProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLSpeedDialTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
