import { createMemo, omit, type Component } from "solid-js";
import type { RLSpeedDialProps } from "./speed-dial.types";
import { speedDialTheme } from "./speed-dial.theme";

export const RLSpeedDial: Component<RLSpeedDialProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    speedDialTheme({
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
