import type { Component } from "solid-js";
import type { RLFieldsetProps } from "./fieldset.types";
import { RLFieldsetTheme } from "./fieldset.theme";

export const RLFieldset: Component<RLFieldsetProps> = (props) => {
  const { classes, rest } = RLFieldsetTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
