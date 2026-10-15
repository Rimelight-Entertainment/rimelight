import type { RLFormProps } from "./form.types";
import { RLFormTheme } from "./form.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLForm: Component<RLFormProps> = (props) => {
  const rest = omit(props, "schema", "state", "ui", "class", "children", "onSubmit");

  const classes = createMemo(() =>
    RLFormTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <form class={classes().root} data-slot="root" onSubmit={props.onSubmit} {...rest}>
      {props.children}
    </form>
  );
};
