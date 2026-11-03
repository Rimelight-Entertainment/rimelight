import type { Component } from "solid-js";
import type { RLListboxProps } from "./listbox.types";
import { RLListboxTheme } from "./listbox.theme";

/**
 * @status stub
 */
export const RLListbox: Component<RLListboxProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLListboxTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
