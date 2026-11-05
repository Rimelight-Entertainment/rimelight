import type { Component } from "solid-js";
import type { RLPasswordProps } from "./password.types";
import { RLPasswordTheme } from "./password.theme";

export const RLPassword: Component<RLPasswordProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLPasswordTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
