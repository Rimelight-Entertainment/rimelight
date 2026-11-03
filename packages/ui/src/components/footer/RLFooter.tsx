import type { Component } from "solid-js";
import type { RLFooterProps } from "./footer.types";
import { RLFooterTheme } from "./footer.theme";

const OMIT_KEYS = ["left", "center", "right"] as const;

export const RLFooter: Component<RLFooterProps> = (props) => {
  const { classes, rest, slots } = RLFooterTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["leftSlot", "centerSlot", "rightSlot"] as const,
  });

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
          {slots.leftSlot()}
        </div>
        <div class={classes().center} data-slot="center">
          {slots.centerSlot()}
        </div>
        <div class={classes().right} data-slot="right">
          {slots.rightSlot()}
        </div>
      </div>
    </footer>
  );
};
