import type { Component } from "solid-js";
import type { RLColorPickerProps } from "./color-picker.types";
import { RLColorPickerTheme } from "./color-picker.theme";

export const RLColorPicker: Component<RLColorPickerProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLColorPickerTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
