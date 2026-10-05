import type { RLPageProps } from "./page.types";
import { RLPageTheme } from "./page.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLPage: Component<RLPageProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() => RLPageTheme({ ui: props.ui, class: props.class }));

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
