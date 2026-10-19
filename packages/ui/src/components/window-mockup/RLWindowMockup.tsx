import type { Component } from "solid-js";
import type { RLWindowMockupProps } from "./window-mockup.types";
import { RLWindowMockupTheme } from "./window-mockup.theme";

export const RLWindowMockup: Component<RLWindowMockupProps> = (props) => {
  const { classes, rest } = RLWindowMockupTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
