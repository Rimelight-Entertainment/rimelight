import { createMemo, omit, type Component } from "solid-js";
import type { RLFieldsetProps } from "./fieldset.types";
import { fieldsetTheme } from "./fieldset.theme";

export const RLFieldset: Component<RLFieldsetProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    fieldsetTheme({
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
