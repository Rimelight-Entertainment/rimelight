import type { Component } from "solid-js";
import type { RLSpinnerProps } from "./spinner.types";
import { RLSpinnerTheme } from "./spinner.theme";

export const RLSpinner: Component<RLSpinnerProps> = (props) => {
  const { classes, rest } = RLSpinnerTheme.setup(props);

  return <div class={classes().root} data-slot="root" data-theme={props.theme} {...rest} />;
};
