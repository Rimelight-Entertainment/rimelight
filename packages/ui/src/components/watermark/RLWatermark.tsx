import type { RLWatermarkProps } from "./watermark.types";
import { RLWatermarkTheme } from "./watermark.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLWatermark: Component<RLWatermarkProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLWatermarkTheme({
      ui: props.ui,
      class: props.class,
      ...props,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
