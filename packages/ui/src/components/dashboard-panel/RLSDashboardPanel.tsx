import { createMemo, Show, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardPanelProps } from "./dashboard-panel"
import { dashboardPanelTheme } from "./dashboard-panel.theme"

export interface RLSDashboardPanelProps extends DashboardPanelProps {
  children?: JSX.Element
  headerSlot?: JSX.Element
  bodySlot?: JSX.Element
  footerSlot?: JSX.Element
  resizeHandleSlot?: JSX.Element
}

const RLSDashboardPanel: Component<RLSDashboardPanelProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "resizable",
    "ui",
    "class",
    "children",
    "headerSlot",
    "bodySlot",
    "footerSlot",
    "resizeHandleSlot"
  ])

  const resizable = () => props.resizable ?? false

  const resolvedClasses = createMemo(() =>
    dashboardPanelTheme({
      size: false,
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <>
      <div
        class={resolvedClasses().root}
        data-slot="root"
        style={{ "flex": "1 1 0%", "min-width": "0" }}
        {...rest}
      >
        {props.headerSlot}

        <div data-slot="body" class={resolvedClasses().body}>
          {props.bodySlot !== undefined ? props.bodySlot : props.children}
        </div>

        {props.footerSlot}
      </div>

      <Show when={resizable()}>
        {props.resizeHandleSlot !== undefined ? (
          props.resizeHandleSlot
        ) : (
          <div
            data-slot="handle"
            class={`${resolvedClasses().handle} hidden lg:block touch-none select-none cursor-ew-resize relative before:absolute before:inset-y-0 before:-left-1.5 before:-right-1.5 before:z-1`}
          />
        )}
      </Show>
    </>
  )
}

export default RLSDashboardPanel
