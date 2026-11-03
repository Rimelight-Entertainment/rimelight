import type { Component } from "solid-js";
import type { RLUserProps } from "./user.types";
import { RLUserTheme } from "./user.theme";

export const RLUser: Component<RLUserProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLUserTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
