import type { Component } from "solid-js";
import type { RLPageProps } from "./page.types";
import { RLPageTheme } from "./page.theme";

export const RLPage: Component<RLPageProps> = (props) => {
  const { classes, rest } = RLPageTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
