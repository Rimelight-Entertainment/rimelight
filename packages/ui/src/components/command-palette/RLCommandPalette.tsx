import type { RLCommandPaletteProps } from "./command-palette.types";
import { RLCommandPaletteTheme } from "./command-palette.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLCommandPalette: Component<RLCommandPaletteProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLCommandPaletteTheme({
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
