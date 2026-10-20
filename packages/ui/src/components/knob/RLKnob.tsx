import type { Component } from "solid-js";
import type { RLKnobProps } from "./knob.types";
import { RLKnobTheme } from "./knob.theme";

export const RLKnob: Component<RLKnobProps> = (props) => {
  const { classes, rest } = RLKnobTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
