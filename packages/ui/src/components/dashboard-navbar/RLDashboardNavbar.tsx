import type { RLDashboardNavbarProps } from "./dashboard-navbar.types";
import { RLDashboardNavbarTheme } from "./dashboard-navbar.theme";
import { Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = ["icon", "title", "toggle", "toggleSide"] as const;

export const RLDashboardNavbar: Component<RLDashboardNavbarProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLDashboardNavbarTheme.setup(props, {
    as: "header",
    omit: OMIT_KEYS,
    slots: ["leadingSlot", "iconSlot", "titleSlot", "centerSlot", "trailingSlot"] as const,
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <div data-slot="leading" class={classes().leading}>
        <Show when={props.toggle !== false && props.toggleSide !== "right"}>
          <button
            type="button"
            data-dashboard-toggle="mobile"
            class={`${classes().toggle} lg:hidden`}
            data-slot="toggle"
            aria-label={uiT("sidebar.toggle")}
          >
            <RLIcon name="menu" class="size-5" />
          </button>
        </Show>

        {slots.leadingSlot() ?? (
          <>
            {slots.iconSlot() ??
              (props.icon ? (
                <RLIcon name={props.icon} class={classes().icon} data-slot="icon" />
              ) : null)}
            <h1 data-slot="title" class={classes().title}>
              {slots.titleSlot() ?? props.title}
            </h1>
          </>
        )}
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
        <Show when={props.toggle !== false && props.toggleSide === "right"}>
          <button
            type="button"
            data-dashboard-toggle="mobile"
            class={`${classes().toggle} lg:hidden`}
            data-slot="toggle"
            aria-label={uiT("sidebar.toggle")}
          >
            <RLIcon name="menu" class="size-5" />
          </button>
        </Show>
      </div>
    </Tag>
  );
};
