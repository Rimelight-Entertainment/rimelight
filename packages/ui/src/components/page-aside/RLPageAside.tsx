import { createMemo, omit, type Component } from "solid-js";
import type { RLPageAsideProps } from "./page-aside.types";
import { pageAsideTheme } from "./page-aside.theme";

export const RLPageAside: Component<RLPageAsideProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() => pageAsideTheme({ ui: props.ui, class: props.class }));

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
