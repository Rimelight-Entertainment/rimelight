import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { RLPageProps } from "./page.types";
import { RLPageTheme } from "./page.theme";

export const RLPage: Component<RLPageProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLPageTheme.setup(props, {
    as: "div",
    slots: ["leadingSlot", "trailingSlot"] as const,
    variants: (s) => ({
      leading: Boolean(s.leadingSlot()),
      trailing: Boolean(s.trailingSlot()),
    }),
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <Show when={slots.leadingSlot()}>
        <div class={classes().leading} data-slot="leading">
          {slots.leadingSlot()}
        </div>
      </Show>

      <div class={classes().center} data-slot="center">
        {children()}
      </div>

      <Show when={slots.trailingSlot()}>
        <div class={classes().trailing} data-slot="trailing">
          {slots.trailingSlot()}
        </div>
      </Show>
    </Tag>
  );
};
