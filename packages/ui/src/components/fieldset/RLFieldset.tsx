import type { RLFieldsetProps } from "./fieldset.types";
import { RLFieldsetTheme } from "./fieldset.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLFieldset: Component<RLFieldsetProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLFieldsetTheme({
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
