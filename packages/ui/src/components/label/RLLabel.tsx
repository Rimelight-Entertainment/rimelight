import { createMemo, omit, type Component } from "solid-js";
import type { RLLabelProps } from "./label";
import { labelTheme } from "./label.theme";

export const RLLabel: Component<RLLabelProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "for", "size", "ui", "class", "children");

  const classes = createMemo(() =>
    labelTheme({
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <label class={classes()["root"]} data-slot="root" for={props.for} {...rest}>
      {props.children}
    </label>
  );
};
