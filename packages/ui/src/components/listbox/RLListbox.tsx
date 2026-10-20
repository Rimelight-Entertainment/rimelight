import type { Component } from "solid-js";
import type { RLListboxProps } from "./listbox.types";
import { RLListboxTheme } from "./listbox.theme";

export const RLListbox: Component<RLListboxProps> = (props) => {
  const { classes, rest } = RLListboxTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
