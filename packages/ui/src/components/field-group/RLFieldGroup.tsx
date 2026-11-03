import { Show, type Component } from "solid-js";
import type { RLFieldGroupProps } from "./field-group.types";
import { RLFieldGroupTheme } from "./field-group.theme";

export const RLFieldGroup: Component<RLFieldGroupProps> = (props) => {
  const { Tag, classes, rest, children, slots, theme } = RLFieldGroupTheme.setup(props, {
    slots: ["leadingSlot", "trailingSlot"] as const,
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <Show when={slots.leadingSlot()}>
        <div class={classes().leading} data-slot="leading">
          {slots.leadingSlot()}
        </div>
      </Show>
      {children()}
      <Show when={slots.trailingSlot()}>
        <div class={classes().trailing} data-slot="trailing">
          {slots.trailingSlot()}
        </div>
      </Show>
    </Tag>
  );
};
