import type { RLContextMenuProps } from "./context-menu.types";
import { RLContextMenuTheme } from "./context-menu.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLContextMenu: Component<RLContextMenuProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLContextMenuTheme({
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
