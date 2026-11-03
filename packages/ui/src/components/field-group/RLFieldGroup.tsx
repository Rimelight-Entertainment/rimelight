import type { Component } from "solid-js";
import type { RLFieldGroupProps } from "./field-group.types";
import { RLFieldGroupTheme } from "./field-group.theme";

export const RLFieldGroup: Component<RLFieldGroupProps> = (props) => {
  const { classes, rest, slots } = RLFieldGroupTheme.setup(props, {
    slots: ["prependSlot", "appendSlot"] as const,
  });

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {slots.prependSlot() ? (
        <div class={classes().prepend} data-slot="prepend">
          {slots.prependSlot()}
        </div>
      ) : null}
      {props.children}
      {slots.appendSlot() ? (
        <div class={classes().append} data-slot="append">
          {slots.appendSlot()}
        </div>
      ) : null}
    </div>
  );
};
