import type { Component } from "solid-js";
import type { RLFieldsetProps } from "./fieldset.types";
import { RLFieldsetTheme } from "./fieldset.theme";

export const RLFieldset: Component<RLFieldsetProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLFieldsetTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
