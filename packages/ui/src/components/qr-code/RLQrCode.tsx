import type { Component } from "solid-js";
import type { RLQrCodeProps } from "./qr-code.types";
import { RLQrCodeTheme } from "./qr-code.theme";

export const RLQrCode: Component<RLQrCodeProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLQrCodeTheme.setup(props);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {children()}
    </Tag>
  );
};
