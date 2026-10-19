import type { Component } from "solid-js";
import type { RLPageHeaderProps } from "./page-header.types";
import { RLPageHeaderTheme } from "./page-header.theme";

export const RLPageHeader: Component<RLPageHeaderProps> = (props) => {
  const { classes, rest } = RLPageHeaderTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
