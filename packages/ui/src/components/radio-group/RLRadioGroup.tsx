import type { RLRadioGroupProps } from "./radio-group.types";
import { RLRadioGroupTheme } from "./radio-group.theme";
import { createMemo, omit, type Component } from "solid-js";

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
    RLRadioGroupTheme({
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
