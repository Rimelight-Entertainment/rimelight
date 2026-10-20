import type { Component } from "solid-js";
import type { RLSpoilerProps } from "./spoiler.types";
import { RLSpoilerTheme } from "./spoiler.theme";

export const RLSpoiler: Component<RLSpoilerProps> = (props) => {
  const { classes, rest } = RLSpoilerTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
