import type { Component } from "solid-js";
import type { RLCommandPaletteProps } from "./command-palette.types";
import { RLCommandPaletteTheme } from "./command-palette.theme";

export const RLCommandPalette: Component<RLCommandPaletteProps> = (props) => {
  const { classes, rest } = RLCommandPaletteTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
