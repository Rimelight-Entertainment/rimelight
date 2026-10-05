import { createMemo, omit, type Component } from "solid-js";
import type { RLFloatingActionProps } from "./floating-action.types";
import { floatingActionTheme } from "./floating-action.theme";

export const RLFloatingAction: Component<RLFloatingActionProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    floatingActionTheme({
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
