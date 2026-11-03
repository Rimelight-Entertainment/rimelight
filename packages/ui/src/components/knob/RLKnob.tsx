import type { Component } from "solid-js";
import type { RLKnobProps } from "./knob.types";
import { RLKnobTheme } from "./knob.theme";

export const RLKnob: Component<RLKnobProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLKnobTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
