import type { Component } from "solid-js";
import type { RLWatermarkProps } from "./watermark.types";
import { RLWatermarkTheme } from "./watermark.theme";

export const RLWatermark: Component<RLWatermarkProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLWatermarkTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
