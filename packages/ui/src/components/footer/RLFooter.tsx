import type { Component } from "solid-js";
import type { RLFooterProps } from "./footer.types";
import { RLFooterTheme } from "./footer.theme";

const OMIT_KEYS = ["left", "center", "right"] as const;

export const RLFooter: Component<RLFooterProps> = (props) => {
  const { classes, rest } = RLFooterTheme.setup(props, { omit: OMIT_KEYS });

  return (
    <footer
      class={classes().root}
      data-slot="root"
      data-contain={props.contain ? "true" : "false"}
      data-theme={props.theme}
      {...rest}
    >
      <div class={classes().container} data-slot="container">
        <div class={classes().left} data-slot="left">
          {props.left}
        </div>
        <div class={classes().center} data-slot="center">
          {props.center}
        </div>
        <div class={classes().right} data-slot="right">
          {props.right}
        </div>
      </div>
    </footer>
  );
};
