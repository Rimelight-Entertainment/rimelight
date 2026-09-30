import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { DockProps } from "./dock";
import { dockTheme } from "./dock.theme";

export interface RLDockProps extends DockProps {
  children?: JSX.Element;
}

const RLDock: Component<RLDockProps> = (allProps) => {
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

export { RLDock };
