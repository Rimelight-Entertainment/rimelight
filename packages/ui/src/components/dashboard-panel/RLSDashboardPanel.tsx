import { createMemo, Show, splitProps, type Component, type JSX } from "solid-js"
import type { DashboardPanelProps } from "./dashboard-panel"
import { dashboardPanelTheme } from "./dashboard-panel.theme"

export interface RLSDashboardPanelProps extends DashboardPanelProps {
  children?: JSX.Element
  header?: JSX.Element
  headerSlot?: JSX.Element
  body?: JSX.Element
  bodySlot?: JSX.Element
  footer?: JSX.Element
  footerSlot?: JSX.Element
  resizeHandle?: JSX.Element
  resizeHandleSlot?: JSX.Element
}

const RLSDashboardPanel: Component<RLSDashboardPanelProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "resizable",
    "ui",
    "class",
    "children",
    "header",
    "headerSlot",
    "body",
    "bodySlot",
    "footer",
    "footerSlot",
    "resizeHandle",
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

  const headerContent = () => props.header ?? props.headerSlot
  const bodyContent = () =>
    props.body !== undefined
      ? props.body
      : props.bodySlot !== undefined
        ? props.bodySlot
        : props.children
  const footerContent = () => props.footer ?? props.footerSlot
  const resizeHandleContent = () => props.resizeHandle ?? props.resizeHandleSlot

  return (
    <>
      <div
        class={`${resolvedClasses().root} flex-1 min-w-0`}
        data-slot="root"
        {...rest}
      >
        {headerContent()}

        <div data-slot="body" class={resolvedClasses().body}>
          {bodyContent()}
        </div>

        {footerContent()}
      </div>

      <Show when={resizable()}>
        {resizeHandleContent() !== undefined ? (
          resizeHandleContent()
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
