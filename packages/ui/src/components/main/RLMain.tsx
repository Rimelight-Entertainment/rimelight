import type { Component } from "solid-js";
import type { RLMainProps } from "./main.types";
import { RLMainTheme } from "./main.theme";

export const RLMain: Component<RLMainProps> = (props) => {
  const { Tag, classes, rest, id, children, theme } = RLMainTheme.setup(props, {
    as: "main",
    idPrefix: "main-content",
  });

  return (
    <Tag id={id()} data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
