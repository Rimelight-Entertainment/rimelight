import type { RLCommandPaletteProps } from "./command-palette.types";
import { RLCommandPaletteTheme } from "./command-palette.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLCommandPalette: Component<RLCommandPaletteProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLCommandPaletteTheme({
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
