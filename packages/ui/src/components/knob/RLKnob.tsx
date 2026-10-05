import type { RLKnobProps } from "./knob.types";
import { RLKnobTheme } from "./knob.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLKnob: Component<RLKnobProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLKnobTheme({
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
