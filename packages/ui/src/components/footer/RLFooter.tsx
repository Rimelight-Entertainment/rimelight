import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { RLFooterProps } from "./footer.types";
import { RLFooterTheme } from "./footer.theme";
import { renderSlot } from "../../slot";

export const RLFooter: Component<RLFooterProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLFooterTheme.setup(props, {
    as: "footer",
    slots: ["leadingSlot", "centerSlot", "trailingSlot"] as const,
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <div class={classes().container} data-slot="container">
        <div class={classes().leading} data-slot="leading">
          {renderSlot(slots.leadingSlot())}
        </div>
        <div class={classes().center} data-slot="center">
          <Show when={slots.centerSlot()} fallback={children()}>
            {renderSlot(slots.centerSlot())}
          </Show>
        </div>
        <div class={classes().trailing} data-slot="trailing">
          {renderSlot(slots.trailingSlot())}
        </div>
      </div>
    </Tag>
  );
};
