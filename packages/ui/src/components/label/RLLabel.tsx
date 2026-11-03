import type { Component } from "solid-js";
import type { RLLabelProps } from "./label.types";
import { RLLabelTheme } from "./label.theme";

export const RLLabel: Component<RLLabelProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLLabelTheme.setup(props, {
    as: "label",
    omit: ["for"] as const,
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} for={props.for} {...rest}>
      {children()}
    </Tag>
  );
};
