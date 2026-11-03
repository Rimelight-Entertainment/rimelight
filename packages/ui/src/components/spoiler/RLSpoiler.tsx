import type { Component } from "solid-js";
import type { RLSpoilerProps } from "./spoiler.types";
import { RLSpoilerTheme } from "./spoiler.theme";

export const RLSpoiler: Component<RLSpoilerProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLSpoilerTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
