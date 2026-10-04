import { createMemo, omit, type Component } from "solid-js";
import type { SpinnerProps } from "./spinner";
import { spinnerTheme } from "./spinner.theme";

export interface RLSpinnerProps extends SpinnerProps {}

export const RLSpinner: Component<RLSpinnerProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "size", "color", "theme", "ui", "class");

  const classes = createMemo(() =>
    spinnerTheme({
      size: props.size ?? "md",
      color: props.color ?? "current",
      ui: props.ui,
      class: props.class,
    }),
  );

  return <div class={classes()["root"]} data-slot="root" data-theme={props.theme} {...rest} />;
};
