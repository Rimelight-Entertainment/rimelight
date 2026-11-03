import type { Component } from "solid-js";
import type { RLSpinnerProps } from "./spinner.types";
import { RLSpinnerTheme } from "./spinner.theme";

export const RLSpinner: Component<RLSpinnerProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLSpinnerTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
