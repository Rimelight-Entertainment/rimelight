import type { Component } from "solid-js";
import type { RLErrorProps } from "./error.types";
import { RLErrorTheme } from "./error.theme";

export const RLError: Component<RLErrorProps> = (props) => {
  const { classes, rest } = RLErrorTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
