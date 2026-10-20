import type { Component } from "solid-js";
import type { RLFormProps } from "./form.types";
import { RLFormTheme } from "./form.theme";

const OMIT_KEYS = ["schema", "state", "onSubmit"] as const;

export const RLForm: Component<RLFormProps> = (props) => {
  const { classes, rest } = RLFormTheme.setup(props, { omit: OMIT_KEYS });

  return (
    <form class={classes().root} data-slot="root" onSubmit={props.onSubmit} {...rest}>
      {props.children}
    </form>
  );
};
