import type { Component } from "solid-js";
import type { RLWindowMockupProps } from "./window-mockup.types";
import { RLWindowMockupTheme } from "./window-mockup.theme";

export const RLWindowMockup: Component<RLWindowMockupProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLWindowMockupTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
