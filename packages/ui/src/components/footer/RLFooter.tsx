import type { RLFooterProps } from "./footer.types";
import { RLFooterTheme } from "./footer.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLFooter: Component<RLFooterProps> = (props) => {
  const rest = omit(
    props,
    "contain",
    "theme",
    "ui",
    "class",
    "left",
    "center",
    "right",
    "children",
  );

  const classes = createMemo(() =>
    RLFooterTheme({
      contain: props.contain,
      ui: props.ui,
      class: props.class,
    }),
  );

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
