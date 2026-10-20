import type { Component } from "solid-js";
import type { RLProseProps } from "./prose.types";
import { RLProseTheme } from "./prose.theme";

export const RLProse: Component<RLProseProps> = (props) => {
  const { classes, rest } = RLProseTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
