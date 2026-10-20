import type { Component } from "solid-js";
import type { RLRadioGroupProps } from "./radio-group.types";
import { RLRadioGroupTheme } from "./radio-group.theme";

const OMIT_KEYS = ["checked", "disabled", "name", "label", "value", "trailing"] as const;

export const RLRadioGroup: Component<RLRadioGroupProps> = (props) => {
  const { classes, rest } = RLRadioGroupTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
