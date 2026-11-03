import type { Component } from "solid-js";
import type { RLFooterProps } from "./footer.types";
import { RLFooterTheme } from "./footer.theme";

export const RLFooter: Component<RLFooterProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLFooterTheme.setup(props, {
    as: "footer",
    slots: ["leadingSlot", "centerSlot", "trailingSlot"] as const,
  });

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      data-contain={props.contain ? "true" : "false"}
      class={classes().root}
      {...rest}
    >
      <div class={classes().container} data-slot="container">
        <div class={classes().leading} data-slot="leading">
          {slots.leadingSlot()}
        </div>
        <div class={classes().center} data-slot="center">
          {slots.centerSlot() ?? children()}
        </div>
        <div class={classes().trailing} data-slot="trailing">
          {slots.trailingSlot()}
        </div>
      </div>
    </Tag>
  );
};
