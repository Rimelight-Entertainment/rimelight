import type { Component } from "solid-js";
import type { RLKbdProps } from "./kbd.types";
import { RLKbdTheme } from "./kbd.theme";

export const RLKbd: Component<RLKbdProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLKbdTheme.setup(props, { as: "kbd" });

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
