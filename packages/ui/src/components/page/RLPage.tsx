import { createMemo, omit, type Component } from "solid-js";
import type { RLPageProps } from "./page.types";
import { pageTheme } from "./page.theme";

export const RLPage: Component<RLPageProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() => pageTheme({ ui: props.ui, class: props.class }));

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
