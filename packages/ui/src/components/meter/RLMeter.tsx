import type { Component } from "solid-js";
import type { RLMeterProps } from "./meter.types";
import { RLMeterTheme } from "./meter.theme";

export const RLMeter: Component<RLMeterProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLMeterTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
