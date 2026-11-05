import { For, Show, type Component } from "solid-js";
import type { RLDashboardSearchButtonProps } from "./dashboard-search-button.types";
import { RLDashboardSearchButtonTheme } from "./dashboard-search-button.theme";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = ["icon", "label", "kbds"] as const;

const DEFAULT_KBDS = [{ value: "meta" }, { value: "k" }];

export const RLDashboardSearchButton: Component<RLDashboardSearchButtonProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLDashboardSearchButtonTheme.setup(props, {
    as: "button",
    omit: OMIT_KEYS,
    slots: ["trailingSlot"] as const,
  });

  return (
    <Tag
      type="button"
      data-dashboard-search-button
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      {...rest}
    >
      <Show when={props.icon !== false}>
        <RLIcon
          name={typeof props.icon === "string" ? props.icon : "search"}
          class={classes().icon}
        />
      </Show>

      <span data-slot="label" class={classes().label}>
        {props.label ?? uiT("search.label")}
      </span>

      <span data-slot="trailing" class={classes().trailing}>
        <Show
          when={slots.trailingSlot()}
          fallback={
            <Show when={(props.kbds ?? DEFAULT_KBDS).length > 0}>
              <span data-slot="kbds" class={classes().kbds}>
                <For each={props.kbds ?? DEFAULT_KBDS}>
                  {(kbd) => {
                    const value = typeof kbd === "string" ? kbd : kbd.value;
                    const label = value === "meta" ? "⌘" : value === "k" ? "K" : value;
                    return (
                      <kbd data-slot="kbd" class={classes().kbd}>
                        {label}
                      </kbd>
                    );
                  }}
                </For>
              </span>
            </Show>
          }
        >
          {slots.trailingSlot()}
        </Show>
      </span>
      {children()}
    </Tag>
  );
};
