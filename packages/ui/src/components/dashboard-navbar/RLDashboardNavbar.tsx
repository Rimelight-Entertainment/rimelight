import type { RLDashboardNavbarProps } from "./dashboard-navbar.types";
import { RLDashboardNavbarTheme } from "./dashboard-navbar.theme";
import { Show, type Component } from "solid-js";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = ["icon", "title", "hasToggle", "side"] as const;

export const RLDashboardNavbar: Component<RLDashboardNavbarProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLDashboardNavbarTheme.setup(props, {
    as: "header",
    omit: OMIT_KEYS,
    slots: ["leadingSlot", "iconSlot", "titleSlot", "centerSlot", "trailingSlot"] as const,
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <div data-slot="leading" class={classes().leading}>
        <Show when={props.hasToggle !== false && props.side !== "right"}>
          <RLButton
            data-dashboard-toggle="mobile"
            data-slot="toggle"
            class={classes().toggle}
            icon="menu"
            aria-label={uiT("sidebar.toggle")}
          />
        </Show>

        <Show
          when={slots.leadingSlot()}
          fallback={
            <>
              <Show
                when={slots.iconSlot()}
                fallback={
                  <Show when={props.icon}>
                    {(icon) => <RLIcon name={icon()} class={classes().icon} data-slot="icon" />}
                  </Show>
                }
              >
                {slots.iconSlot()}
              </Show>
              <h1 data-slot="title" class={classes().title}>
                <Show when={slots.titleSlot()} fallback={props.title}>
                  {slots.titleSlot()}
                </Show>
              </h1>
            </>
          }
        >
          {slots.leadingSlot()}
        </Show>
      </div>

      <Show when={slots.centerSlot() ?? children()}>
        {(content) => (
          <div data-slot="center" class={classes().center}>
            {content()}
          </div>
        )}
      </Show>

      <div data-slot="trailing" class={classes().trailing}>
        {slots.trailingSlot()}
        <Show when={props.hasToggle !== false && props.side === "right"}>
          <RLButton
            data-dashboard-toggle="mobile"
            data-slot="toggle"
            class={classes().toggle}
            icon="menu"
            aria-label={uiT("sidebar.toggle")}
          />
        </Show>
      </div>
    </Tag>
  );
};
