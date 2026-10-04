import { createMemo, omit, type Component } from "solid-js";
import type { RLDockProps } from "./dock";
import { dockTheme } from "./dock.theme";

export const RLDock: Component<RLDockProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    dockTheme({
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
