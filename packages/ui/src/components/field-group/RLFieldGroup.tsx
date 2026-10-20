import type { Component } from "solid-js";
import type { RLFieldGroupProps } from "./field-group.types";
import { RLFieldGroupTheme } from "./field-group.theme";

const OMIT_KEYS = ["prepend", "append"] as const;

export const RLFieldGroup: Component<RLFieldGroupProps> = (props) => {
  const { classes, rest } = RLFieldGroupTheme.setup(props, { omit: OMIT_KEYS });

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.prepend ? (
        <div class={classes().prepend} data-slot="prepend">
          {props.prepend}
        </div>
      ) : null}
      {props.children}
      {props.append ? (
        <div class={classes().append} data-slot="append">
          {props.append}
        </div>
      ) : null}
    </div>
  );
};
