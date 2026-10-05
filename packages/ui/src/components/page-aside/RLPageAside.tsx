import type { RLPageAsideProps } from "./page-aside.types";
import { RLPageAsideTheme } from "./page-aside.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPageAside: Component<RLPageAsideProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() => RLPageAsideTheme({ ui: props.ui, class: props.class }));

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
