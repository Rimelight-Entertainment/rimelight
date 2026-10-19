import type { Component } from "solid-js";
import type { RLKbdProps } from "./kbd.types";
import { RLKbdTheme } from "./kbd.theme";

export const RLKbd: Component<RLKbdProps> = (props) => {
  const rest = RLKbdTheme.omit(props);
  const classes = RLKbdTheme.use(props);

  return (
    <kbd class={classes().root} data-slot="root" data-theme={props.theme} {...rest}>
      {props.children}
    </kbd>
  );
};
