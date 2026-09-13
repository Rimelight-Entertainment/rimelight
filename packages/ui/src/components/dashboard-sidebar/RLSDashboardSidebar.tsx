import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
  splitProps,
  type Component,
  type JSX
} from "solid-js"
import type { DashboardSidebarProps } from "./dashboard-sidebar"
import { dashboardSidebarTheme } from "./dashboard-sidebar.theme"

export interface RLSDashboardSidebarProps extends DashboardSidebarProps {
  children?: JSX.Element
  headerSlot?: JSX.Element
  footerSlot?: JSX.Element
  openMobile?: boolean
  onOpenMobileChange?: (open: boolean) => void
  onCollapseChange?: (collapsed: boolean) => void
}

const RLSDashboardSidebar: Component<RLSDashboardSidebarProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "side",
    "collapsible",
    "collapsed",
    "openMobile",
    "headerSlot",
    "footerSlot",
    "ui",
    "class",
    "children",
    "onOpenMobileChange",
    "onCollapseChange"
  ])

  const side = () => props.side ?? "left"
  const isCollapsible = () => props.collapsible ?? false
  const [isCollapsed, setIsCollapsed] = createSignal(props.collapsed ?? false)
  const [isMobileOpen, setIsMobileOpen] = createSignal(props.openMobile ?? false)

  createEffect(() => {
    if (props.collapsed !== undefined) {
      setIsCollapsed(props.collapsed)
    }
  })

  createEffect(() => {
    if (props.openMobile !== undefined) {
      setIsMobileOpen(props.openMobile)
    }
  })

  const setCollapsedState = (collapsed: boolean) => {
    if (props.collapsed === undefined) {
      setIsCollapsed(collapsed)
    }
    props.onCollapseChange?.(collapsed)
  }

  const setMobileOpenState = (open: boolean) => {
    if (props.openMobile === undefined) {
      setIsMobileOpen(open)
    }
    props.onOpenMobileChange?.(open)
  }

  onMount(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (!target) return

      const toggle = target.closest<HTMLElement>("[data-dashboard-toggle]")
      if (toggle) {
        const toggleType = toggle.dataset["dashboardToggle"]
        if (toggleType === "mobile") {
          setMobileOpenState(!isMobileOpen())
        }
        if (toggleType === "collapse" && isCollapsible()) {
          setCollapsedState(!isCollapsed())
        }
        return
      }

      if (target.closest("[data-dashboard-sidebar-mobile] a")) {
        setMobileOpenState(false)
      }
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen()) {
        setMobileOpenState(false)
      }
    }

    document.addEventListener("click", handleClick)
    document.addEventListener("keydown", handleKey)

    onCleanup(() => {
      document.removeEventListener("click", handleClick)
      document.removeEventListener("keydown", handleKey)
    })
  })

  const resolvedClasses = createMemo(() =>
    dashboardSidebarTheme({
      side: side(),
      collapsed: isCollapsible() && isCollapsed(),
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <>
      <div
        data-dashboard-sidebar
        data-side={side()}
        data-collapsible={isCollapsible() ? "true" : "false"}
        data-collapsed={isCollapsible() && isCollapsed() ? "true" : "false"}
        data-slot="root"
        class={resolvedClasses().root}
        {...rest}
      >
        <Show when={props.headerSlot !== undefined}>
          <div data-slot="header" class={resolvedClasses().header}>
            {props.headerSlot}
          </div>
        </Show>

        <div data-slot="body" class={resolvedClasses().body}>
          {props.children}
        </div>

        <Show when={props.footerSlot !== undefined}>
          <div data-slot="footer" class={resolvedClasses().footer}>
            {props.footerSlot}
          </div>
        </Show>
      </div>

      <div
        data-dashboard-sidebar-overlay
        data-slot="overlay"
        class={`${resolvedClasses().overlay} fixed inset-0 z-40 bg-default/80 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileOpen() ? "block" : "hidden"
        }`}
        onClick={() => setMobileOpenState(false)}
      />

      <div
        data-dashboard-sidebar-mobile
        data-slot="content"
        class={`${resolvedClasses().content} fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-default shadow-2xl border-e border-default transform transition-transform duration-300 flex flex-col h-full ${
          isMobileOpen() ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Show when={props.headerSlot !== undefined}>
          <div data-slot="header" class={`${resolvedClasses().header} sm:px-6 shrink-0`} data-menu>
            {props.headerSlot}
          </div>
        </Show>

        <div
          data-slot="body"
          class={`${resolvedClasses().body} sm:px-6 overflow-y-auto flex-1`}
          data-menu
        >
          {props.children}
        </div>

        <Show when={props.footerSlot !== undefined}>
          <div data-slot="footer" class={`${resolvedClasses().footer} sm:px-6 shrink-0`} data-menu>
            {props.footerSlot}
          </div>
        </Show>
      </div>
    </>
  )
}

export default RLSDashboardSidebar
