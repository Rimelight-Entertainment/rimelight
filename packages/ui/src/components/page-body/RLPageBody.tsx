import { createMemo, omit, type Component } from "solid-js";
import type { RLPageBodyProps } from "./page-body";
import { pageBodyTheme } from "./page-body.theme";

export const RLPageBody: Component<RLPageBodyProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() => pageBodyTheme({ ui: props.ui, class: props.class }));

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
