import { createMemo, omit, type Component } from "solid-js";
import type { RLRadioGroupProps } from "./radio-group";
import { radioGroupTheme } from "./radio-group.theme";

export const RLRadioGroup: Component<RLRadioGroupProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "ui",
    "class",
    "children",
    "checked",
    "disabled",
    "name",
    "label",
    "value",
    "trailing",
  );

  const resolvedClasses = createMemo(() =>
    radioGroupTheme({
      ui: props.ui,
      class: props.class,
      ...allProps,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
