import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { ContextMenuProps } from "./context-menu";
import { contextMenuTheme } from "./context-menu.theme";

export interface RLContextMenuProps extends ContextMenuProps {
  children?: JSX.Element;
}

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
