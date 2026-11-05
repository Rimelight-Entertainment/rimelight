import type { Component } from "solid-js";
import type { RLListboxProps } from "./listbox.types";
import { RLListboxTheme } from "./listbox.theme";

export const RLListbox: Component<RLListboxProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLListboxTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
