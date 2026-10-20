import type { Component } from "solid-js";
import type { RLKbdProps } from "./kbd.types";
import { RLKbdTheme } from "./kbd.theme";

export const RLKbd: Component<RLKbdProps> = (props) => {
  const { classes, rest } = RLKbdTheme.setup(props);

  return (
    <kbd class={classes().root} data-slot="root" data-theme={props.theme} {...rest}>
      {props.children}
    </kbd>
  );
};
