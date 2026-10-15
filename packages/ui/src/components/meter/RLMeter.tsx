import type { RLMeterProps } from "./meter.types";
import { RLMeterTheme } from "./meter.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLMeter: Component<RLMeterProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLMeterTheme({
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
