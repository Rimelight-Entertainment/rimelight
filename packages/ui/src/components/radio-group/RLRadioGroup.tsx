import type { RLRadioGroupProps } from "./radio-group.types";
import { RLRadioGroupTheme } from "./radio-group.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLRadioGroup: Component<RLRadioGroupProps> = (props) => {
  const rest = omit(
    props,
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

  const classes = createMemo(() =>
    RLRadioGroupTheme({
      ui: props.ui,
      class: props.class,
      ...props,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
