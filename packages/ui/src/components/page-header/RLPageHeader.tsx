import type { Component } from "solid-js";
import type { RLPageHeaderProps } from "./page-header.types";
import { RLPageHeaderTheme } from "./page-header.theme";

export const RLPageHeader: Component<RLPageHeaderProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLPageHeaderTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
