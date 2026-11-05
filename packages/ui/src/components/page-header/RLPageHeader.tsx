import type { Component } from "solid-js";
import type { RLPageHeaderProps } from "./page-header.types";
import { RLPageHeaderTheme } from "./page-header.theme";

export const RLPageHeader: Component<RLPageHeaderProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLPageHeaderTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
