import type { RLDockProps } from "./dock.types";
import { RLDockTheme } from "./dock.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLDock: Component<RLDockProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLDockTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
