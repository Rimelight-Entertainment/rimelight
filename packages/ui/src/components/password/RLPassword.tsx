import type { Component } from "solid-js";
import type { RLPasswordProps } from "./password.types";
import { RLPasswordTheme } from "./password.theme";

/**
 * @status stub
 */
export const RLPassword: Component<RLPasswordProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLPasswordTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
