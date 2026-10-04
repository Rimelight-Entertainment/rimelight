import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { FieldsetProps } from "./fieldset";
import { fieldsetTheme } from "./fieldset.theme";

export interface RLFieldsetProps extends FieldsetProps {
  children?: JSX.Element;
}

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
