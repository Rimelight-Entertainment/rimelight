import { createMemo, omit, type Component } from "solid-js";
import type { RLKbdProps } from "./kbd.types";
import { kbdTheme } from "./kbd.theme";

export const RLKbd: Component<RLKbdProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "color", "variant", "size", "theme", "ui", "class", "children");

  const classes = createMemo(() =>
    kbdTheme({
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
