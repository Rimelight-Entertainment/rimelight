import type { Component } from "solid-js";
import type { RLRatingProps } from "./rating.types";
import { RLRatingTheme } from "./rating.theme";

export const RLRating: Component<RLRatingProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLRatingTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
