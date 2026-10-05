import { createMemo, omit, type Component } from "solid-js";
import type { RLContextMenuProps } from "./context-menu.types";
import { contextMenuTheme } from "./context-menu.theme";

export const RLContextMenu: Component<RLContextMenuProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    contextMenuTheme({
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
