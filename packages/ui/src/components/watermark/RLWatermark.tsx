import type { Component } from "solid-js";
import type { RLWatermarkProps } from "./watermark.types";
import { RLWatermarkTheme } from "./watermark.theme";

export const RLWatermark: Component<RLWatermarkProps> = (props) => {
  const { classes, rest } = RLWatermarkTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
