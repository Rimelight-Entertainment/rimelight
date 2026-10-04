import { createMemo, omit, type Component } from "solid-js";
import type { RLKnobProps } from "./knob";
import { knobTheme } from "./knob.theme";

export const RLKnob: Component<RLKnobProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    knobTheme({
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
