import type { Component } from "solid-js";
import type { RLPageAsideProps } from "./page-aside.types";
import { RLPageAsideTheme } from "./page-aside.theme";

export const RLPageAside: Component<RLPageAsideProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLPageAsideTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
