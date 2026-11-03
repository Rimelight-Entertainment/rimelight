import type { Component } from "solid-js";
import type { RLTourProps } from "./tour.types";
import { RLTourTheme } from "./tour.theme";

export const RLTour: Component<RLTourProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLTourTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
