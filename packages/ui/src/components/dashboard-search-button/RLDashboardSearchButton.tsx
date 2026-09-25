import { createMemo, For, Show, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardSearchButtonProps } from "./dashboard-search-button"
import { dashboardSearchButtonTheme } from "./dashboard-search-button.theme"
import RLIcon from "../icon/RLIcon"

export interface RLDashboardSearchButtonProps extends DashboardSearchButtonProps {
  children?: JSX.Element
  trailingSlot?: JSX.Element
}

const RLDashboardSearchButton: Component<RLDashboardSearchButtonProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "icon",
    "label",
    "kbds",
    "collapsed",
    "trailing",
    "trailingSlot",
    "ui",
    "class",
    "children"
  ])

  const labelText = () => props.label ?? "Search"
  const kbdsList = () => props.kbds ?? [{ value: "meta" }, { value: "k" }]

  const resolvedClasses = createMemo(() =>
    dashboardSearchButtonTheme({
      collapsed: props.collapsed ?? false,
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <button
      type="button"
      data-dashboard-search-button
      class={resolvedClasses().base}
      data-slot="root"
      {...rest}
    >
      {props.icon !== false && (
        <RLIcon
          name={typeof props.icon === "string" ? props.icon : "search"}
          class="size-5 shrink-0 text-muted"
        />
      )}

      <span data-slot="label" class={resolvedClasses().label}>
        {labelText()}
      </span>

      <span data-slot="trailing" class={resolvedClasses().trailing}>
        {props.trailingSlot ? (
          props.trailingSlot
        ) : props.trailing ? (
          (props.trailing as JSX.Element)
        ) : (
          <Show when={kbdsList().length > 0}>
            <span class="flex items-center gap-0.5">
              <For each={kbdsList()}>
                {(kbd) => {
                  const val = typeof kbd === "string" ? kbd : kbd.value
                  const txt = val === "meta" ? "⌘" : val === "k" ? "K" : val
                  return (
                    <kbd class="inline-flex items-center justify-center rounded border border-default bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted min-w-[20px] h-5">
                      {txt}
                    </kbd>
                  )
                }}
              </For>
            </span>
          </Show>
        )}
      </span>
      {props.children}
    </button>
  )
}

export { RLDashboardSearchButton }
export default RLDashboardSearchButton
