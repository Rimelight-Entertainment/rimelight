import type { RLWindowMockupProps } from "./window-mockup.types";
import { RLWindowMockupTheme } from "./window-mockup.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLWindowMockup: Component<RLWindowMockupProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLWindowMockupTheme({
      ui: props.ui,
      class: props.class,
      ...props,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
