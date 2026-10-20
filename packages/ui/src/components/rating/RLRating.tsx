import type { Component } from "solid-js";
import type { RLRatingProps } from "./rating.types";
import { RLRatingTheme } from "./rating.theme";

export const RLRating: Component<RLRatingProps> = (props) => {
  const { classes, rest } = RLRatingTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
