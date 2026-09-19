import { createMemo, Show, splitProps, type Component, type JSX } from "solid-js"
import { Dynamic } from "solid-js/web"
import type { DashboardNavbarProps } from "./dashboard-navbar"
import { dashboardNavbarTheme } from "./dashboard-navbar.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSDashboardNavbarProps extends DashboardNavbarProps {
  children?: JSX.Element
  leftSlot?: JSX.Element
  rightSlot?: JSX.Element
  centerSlot?: JSX.Element
  titleSlot?: JSX.Element
  leadingSlot?: JSX.Element
  trailingSlot?: JSX.Element
}

const RLSDashboardNavbar: Component<RLSDashboardNavbarProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "as",
    "icon",
    "title",
    "toggle",
    "toggleSide",
    "ui",
    "class",
    "children",
    "leftSlot",
    "rightSlot",
    "centerSlot",
    "titleSlot",
    "leadingSlot",
    "trailingSlot"
  ])

  const Tag = () => props.as || "header"
  const showToggle = () => props.toggle ?? true
  const toggleSide = () => props.toggleSide ?? "left"

  const resolvedClasses = createMemo(() =>
    dashboardNavbarTheme({
      toggleSide: toggleSide(),
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <Dynamic component={Tag()} class={resolvedClasses().root} data-slot="root" {...rest}>
      <div data-slot="left" class={resolvedClasses().left}>
        <Show when={showToggle() && toggleSide() === "left"}>
          <button
            type="button"
            data-dashboard-toggle="mobile"
            class={`${resolvedClasses().toggle} lg:hidden`}
            data-slot="toggle"
            aria-label="Toggle sidebar"
          >
            <RLSIcon name="menu" class="size-5" />
          </button>
        </Show>

        <Show when={props.leftSlot === undefined} fallback={props.leftSlot}>
          {props.leadingSlot !== undefined ? (
            props.leadingSlot
          ) : props.icon ? (
            <RLSIcon name={props.icon} class={resolvedClasses().icon} data-slot="icon" />
          ) : null}

          <h1 data-slot="title" class={resolvedClasses().title}>
            {props.titleSlot !== undefined ? props.titleSlot : props.title}
          </h1>

          {props.trailingSlot}
        </Show>
      </div>

      <Show when={props.children !== undefined || props.centerSlot !== undefined}>
        <div data-slot="center" class={resolvedClasses().center}>
          {props.centerSlot !== undefined ? props.centerSlot : props.children}
        </div>
      </Show>

      <div data-slot="right" class={resolvedClasses().right}>
        {props.rightSlot}

        <Show when={showToggle() && toggleSide() === "right"}>
          <button
            type="button"
            data-dashboard-toggle="mobile"
            class={`${resolvedClasses().toggle} lg:hidden`}
            data-slot="toggle"
            aria-label="Toggle sidebar"
          >
            <RLSIcon name="menu" class="size-5" />
          </button>
        </Show>
      </div>
    </Dynamic>
  )
}

export default RLSDashboardNavbar
