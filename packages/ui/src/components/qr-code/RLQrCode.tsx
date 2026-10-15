import type { RLQrCodeProps } from "./qr-code.types";
import { RLQrCodeTheme } from "./qr-code.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLQrCode: Component<RLQrCodeProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() =>
    RLQrCodeTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
