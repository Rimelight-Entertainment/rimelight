import type { Component } from "solid-js";
import type { RLColorPickerProps } from "./color-picker.types";
import { RLColorPickerTheme } from "./color-picker.theme";

export const RLColorPicker: Component<RLColorPickerProps> = (props) => {
  const { classes, rest } = RLColorPickerTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
