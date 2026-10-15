import type { RLSpinnerProps } from "./spinner.types";
import { RLSpinnerTheme } from "./spinner.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLSpinner: Component<RLSpinnerProps> = (props) => {
  const rest = omit(props, "size", "color", "theme", "ui", "class");

  const classes = createMemo(() =>
    RLSpinnerTheme({
      size: props.size ?? "md",
      color: props.color ?? "current",
      ui: props.ui,
      class: props.class,
    }),
  );

  return <div class={classes()["root"]} data-slot="root" data-theme={props.theme} {...rest} />;
};
