import type { Component } from "solid-js";
import type { RLUserProps } from "./user.types";
import { RLUserTheme } from "./user.theme";

export const RLUser: Component<RLUserProps> = (props) => {
  const { classes, rest } = RLUserTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
