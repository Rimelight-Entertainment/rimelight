import type { RLPageHeaderProps } from "./page-header.types";
import { RLPageHeaderTheme } from "./page-header.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPageHeader: Component<RLPageHeaderProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() => RLPageHeaderTheme({ ui: props.ui, class: props.class }));

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
