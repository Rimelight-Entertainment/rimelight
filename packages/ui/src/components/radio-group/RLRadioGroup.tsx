import type { Component } from "solid-js";
import type { RLRadioGroupProps } from "./radio-group.types";
import { RLRadioGroupTheme } from "./radio-group.theme";

/**
 * @status stub
 */
export const RLRadioGroup: Component<RLRadioGroupProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLRadioGroupTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
