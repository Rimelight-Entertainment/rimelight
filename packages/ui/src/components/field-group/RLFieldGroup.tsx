import { Show, type Component } from "solid-js";
import type { RLFieldGroupProps } from "./field-group.types";
import { RLFieldGroupTheme } from "./field-group.theme";
import { renderSlot } from "../../slot";

export const RLFieldGroup: Component<RLFieldGroupProps> = (props) => {
  const { Tag, classes, rest, children, slots, theme } = RLFieldGroupTheme.setup(props, {
    slots: ["leadingSlot", "trailingSlot"] as const,
  });

  const hasLeading = () => Boolean(slots.leadingSlot());
  const hasTrailing = () => Boolean(slots.trailingSlot());

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <Show when={hasLeading()}>
        <div class={classes().leading} data-slot="leading">
          {renderSlot(slots.leadingSlot())}
        </div>
      </Show>
      {children()}
      <Show when={hasTrailing()}>
        <div class={classes().trailing} data-slot="trailing">
          {renderSlot(slots.trailingSlot())}
        </div>
      </Show>
    </Tag>
  );
};
