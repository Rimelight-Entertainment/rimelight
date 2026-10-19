import type { Component } from "solid-js";
import type { RLTourProps } from "./tour.types";
import { RLTourTheme } from "./tour.theme";

export const RLTour: Component<RLTourProps> = (props) => {
  const { classes, rest } = RLTourTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
