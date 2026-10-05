import type { RLTreeProps } from "./tree.types";
import { RLTreeTheme } from "./tree.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLTree: Component<RLTreeProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLTreeTheme({
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
