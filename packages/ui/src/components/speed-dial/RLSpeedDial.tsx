import type { RLSpeedDialProps } from "./speed-dial.types";
import { RLSpeedDialTheme } from "./speed-dial.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLSpeedDial: Component<RLSpeedDialProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLSpeedDialTheme({
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
