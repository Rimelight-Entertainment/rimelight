import type { Component } from "solid-js";
import type { RLLabelProps } from "./label.types";
import { RLLabelTheme } from "./label.theme";

const OMIT_KEYS = ["for"] as const;

export const RLLabel: Component<RLLabelProps> = (props) => {
  const { classes, rest } = RLLabelTheme.setup(props, { omit: OMIT_KEYS });

  return (
    <label class={classes().root} data-slot="root" for={props.for} {...rest}>
      {props.children}
    </label>
  );
};
