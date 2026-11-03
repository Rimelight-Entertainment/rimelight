import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { RLPageProps } from "./page.types";
import { RLPageTheme } from "./page.theme";

export const RLPage: Component<RLPageProps> = (props) => {
  const {
    Tag: Root,
    classes,
    rest,
    slots,
  } = RLPageTheme.setup(props, {
    as: "div",
    slots: ["leftSlot", "rightSlot"] as const,
    variants: (s) => ({
      left: Boolean(s.leftSlot()),
      right: Boolean(s.rightSlot()),
    }),
  });

  return (
    <Root class={classes().root} data-slot="root" {...rest}>
      <Show when={slots.leftSlot()}>
        <div class={classes().left} data-slot="left">
          {slots.leftSlot()}
        </div>
      </Show>

      <div class={classes().center} data-slot="center">
        {props.children}
      </div>

      <Show when={slots.rightSlot()}>
        <div class={classes().right} data-slot="right">
          {slots.rightSlot()}
        </div>
      </Show>
    </Root>
  );
};
