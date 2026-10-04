import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { PageBodyProps } from "./page-body";
import { pageBodyTheme } from "./page-body.theme";

export interface RLPageBodyProps extends PageBodyProps {
  children?: JSX.Element;
}

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
