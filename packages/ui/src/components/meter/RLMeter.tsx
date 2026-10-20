import type { Component } from "solid-js";
import type { RLMeterProps } from "./meter.types";
import { RLMeterTheme } from "./meter.theme";

export const RLMeter: Component<RLMeterProps> = (props) => {
  const { classes, rest } = RLMeterTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
