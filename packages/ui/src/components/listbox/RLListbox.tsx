import type { RLListboxProps } from "./listbox.types";
import { RLListboxTheme } from "./listbox.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLListbox: Component<RLListboxProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLListboxTheme({
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
