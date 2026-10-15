import type { RLTourProps } from "./tour.types";
import { RLTourTheme } from "./tour.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLTour: Component<RLTourProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLTourTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
