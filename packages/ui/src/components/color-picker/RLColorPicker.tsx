import { createMemo, omit, type Component } from "solid-js";
import type { RLColorPickerProps } from "./color-picker";
import { colorPickerTheme } from "./color-picker.theme";

export const RLColorPicker: Component<RLColorPickerProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    colorPickerTheme({
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
