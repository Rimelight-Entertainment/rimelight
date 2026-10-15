import type { RLRatingProps } from "./rating.types";
import { RLRatingTheme } from "./rating.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLRating: Component<RLRatingProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLRatingTheme({
      ui: props.ui,
      class: props.class,
      ...props,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
