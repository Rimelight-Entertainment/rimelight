import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { MeterProps } from "./meter";
import { meterTheme } from "./meter.theme";

export interface RLMeterProps extends MeterProps {
  children?: JSX.Element;
}

export const RLMeter: Component<RLMeterProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    meterTheme({
      ui: props.ui,
      class: props.class,
      ...allProps,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
