import type { RLKbdProps } from "./kbd.types";
import { RLKbdTheme } from "./kbd.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLKbd: Component<RLKbdProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "color", "variant", "size", "theme", "ui", "class", "children");

  const classes = createMemo(() =>
    RLKbdTheme({
      color: props.color ?? "neutral",
      variant: props.variant ?? "outline",
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <kbd class={classes()["root"]} data-slot="root" data-theme={props.theme} {...rest}>
      {props.children}
    </kbd>
  );
};
