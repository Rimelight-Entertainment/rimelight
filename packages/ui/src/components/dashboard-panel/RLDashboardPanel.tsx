import { Show, type Component } from "solid-js";
import type { RLDashboardPanelProps } from "./dashboard-panel.types";
import { RLDashboardPanelTheme } from "./dashboard-panel.theme";

export const RLDashboardPanel: Component<RLDashboardPanelProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLDashboardPanelTheme.setup(props, {
    slots: ["headerSlot", "bodySlot", "footerSlot", "handleSlot"] as const,
  });

  return (
    <>
      <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
        <Show when={slots.headerSlot()}>
          <div data-slot="header" class={classes().header}>
            {slots.headerSlot()}
          </div>
        </Show>

        <div data-slot="body" class={classes().body}>
          <Show when={slots.bodySlot()} fallback={children()}>
            {slots.bodySlot()}
          </Show>
        </div>

        <Show when={slots.footerSlot()}>
          <div data-slot="footer" class={classes().footer}>
            {slots.footerSlot()}
          </div>
        </Show>
      </Tag>

      <Show when={props.resizable}>
        <Show
          when={slots.handleSlot()}
          fallback={<div data-slot="handle" class={classes().handle} />}
        >
          {slots.handleSlot()}
        </Show>
      </Show>
    </>
  );
};
