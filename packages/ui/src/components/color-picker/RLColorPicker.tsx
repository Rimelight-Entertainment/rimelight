import type { RLColorPickerProps } from "./color-picker.types";
import { RLColorPickerTheme } from "./color-picker.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLColorPicker: Component<RLColorPickerProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLColorPickerTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
