import type { RLFieldGroupProps } from "./field-group.types";
import { RLFieldGroupTheme } from "./field-group.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLFieldGroup: Component<RLFieldGroupProps> = (props) => {
  const rest = omit(props, "prepend", "append", "size", "ui", "class", "children");

  const classes = createMemo(() =>
    RLFieldGroupTheme({
      size: props["size"] ?? "md",
      ui: props["ui"],
      class: props["class"],
    }),
  );

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
