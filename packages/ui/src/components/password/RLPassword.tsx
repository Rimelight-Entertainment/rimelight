import type { Component } from "solid-js";
import type { RLPasswordProps } from "./password.types";
import { RLPasswordTheme } from "./password.theme";

export const RLPassword: Component<RLPasswordProps> = (props) => {
  const { classes, rest } = RLPasswordTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
