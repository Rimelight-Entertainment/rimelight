import type { RLFieldsetProps } from "./fieldset.types";
import { RLFieldsetTheme } from "./fieldset.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLFieldset: Component<RLFieldsetProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLFieldsetTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
