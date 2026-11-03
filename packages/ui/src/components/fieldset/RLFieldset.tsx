import type { Component } from "solid-js";
import type { RLFieldsetProps } from "./fieldset.types";
import { RLFieldsetTheme } from "./fieldset.theme";

/**
 * @status stub
 */
export const RLFieldset: Component<RLFieldsetProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLFieldsetTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
