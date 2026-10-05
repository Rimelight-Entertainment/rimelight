import type { RLMeterProps } from "./meter.types";
import { RLMeterTheme } from "./meter.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLMeter: Component<RLMeterProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLMeterTheme({
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
