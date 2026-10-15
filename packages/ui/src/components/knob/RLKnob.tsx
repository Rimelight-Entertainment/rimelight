import type { RLKnobProps } from "./knob.types";
import { RLKnobTheme } from "./knob.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLKnob: Component<RLKnobProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLKnobTheme({
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
