import type { Component } from "solid-js";
import type { RLDashboardSearchButtonProps } from "./dashboard-search-button.types";
import { RLDashboardSearchButtonTheme } from "./dashboard-search-button.theme";
import { For, Show } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = ["icon", "label", "kbds"] as const;

export const RLDashboardSearchButton: Component<RLDashboardSearchButtonProps> = (props) => {
  const { classes, rest, slots } = RLDashboardSearchButtonTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["trailingSlot"] as const,
  });

  const labelText = () => props.label ?? "Search";
  const kbdsList = () => props.kbds ?? [{ value: "meta" }, { value: "k" }];

  return (
    <button
      type="button"
      data-dashboard-search-button
      class={classes().base}
      data-slot="root"
      {...rest}
    >
      {props.icon !== false && (
        <RLIcon
          name={typeof props.icon === "string" ? props.icon : "search"}
          class="size-5 shrink-0 text-muted"
        />
      )}

      <span data-slot="label" class={classes().label}>
        {labelText()}
      </span>

      <span data-slot="trailing" class={classes().trailing}>
        <Show
          when={slots.trailingSlot()}
          fallback={
            <Show when={kbdsList().length > 0}>
              <span class="flex items-center gap-0.5">
                <For each={kbdsList()}>
                  {(kbd) => {
                    const val = typeof kbd === "string" ? kbd : kbd.value;
                    const txt = val === "meta" ? "⌘" : val === "k" ? "K" : val;
                    return (
                      <kbd class="inline-flex items-center justify-center rounded border border-default bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted min-w-[20px] h-5">
                        {txt}
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
      {props.children}
    </button>
  );
};
