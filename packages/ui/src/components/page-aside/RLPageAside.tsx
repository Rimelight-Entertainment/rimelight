import type { Component } from "solid-js";
import type { RLPageAsideProps } from "./page-aside.types";
import { RLPageAsideTheme } from "./page-aside.theme";

export const RLPageAside: Component<RLPageAsideProps> = (props) => {
  const { classes, rest } = RLPageAsideTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
