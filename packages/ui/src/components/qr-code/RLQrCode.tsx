import type { Component } from "solid-js";
import type { RLQrCodeProps } from "./qr-code.types";
import { RLQrCodeTheme } from "./qr-code.theme";

export const RLQrCode: Component<RLQrCodeProps> = (props) => {
  const { classes, rest } = RLQrCodeTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
