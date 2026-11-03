import type { Component } from "solid-js";
import type { RLCommandPaletteProps } from "./command-palette.types";
import { RLCommandPaletteTheme } from "./command-palette.theme";

export const RLCommandPalette: Component<RLCommandPaletteProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLCommandPaletteTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
