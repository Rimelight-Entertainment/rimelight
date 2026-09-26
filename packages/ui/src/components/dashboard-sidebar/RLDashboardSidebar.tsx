import {
  createEffect,
  createMemo,
  createSignal,
  onSettled,
  omit,
  type Component
} from "solid-js"
import type { JSX } from "@solidjs/web"
import type { DashboardSidebarProps } from "./dashboard-sidebar"
import { dashboardSidebarTheme } from "./dashboard-sidebar.theme"

export interface RLDashboardSidebarProps extends DashboardSidebarProps {
  children?: JSX.Element
  headerSlot?: JSX.Element
  footerSlot?: JSX.Element
  openMobile?: boolean
  onOpenMobileChange?: (open: boolean) => void
  onCollapseChange?: (collapsed: boolean) => void
}

const RLDashboardSidebar: Component<RLDashboardSidebarProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
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
  )

  const side = () => props.side ?? "left"
  const isCollapsible = () => props.collapsible ?? false
  const [isCollapsed, setIsCollapsed] = createSignal(props.collapsed ?? false)
  const [isMobileOpen, setIsMobileOpen] = createSignal(props.openMobile ?? false)

  createEffect(
    () => props.collapsed,
    (collapsed) => {
      if (collapsed !== undefined) {
        setIsCollapsed(collapsed)
      }
    }
  )

  createEffect(
    () => props.openMobile,
    (openMobile) => {
      if (openMobile !== undefined) {
        setIsMobileOpen(openMobile)
      }
    }
  )

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

  onSettled(() => {
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

    return () => {
      document.removeEventListener("click", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  })

  const resolvedClasses = createMemo(() =>
    dashboardSidebarTheme({
      side: side(),
      collapsed: isCollapsible() && isCollapsed(),
      ui: props.ui,
      class: props.class
    })
  )

  const headerContent = () =>
    props.headerSlot !== undefined ? (
      <div data-slot="header" class={resolvedClasses().header}>
        {props.headerSlot}
      </div>
    ) : null

  const footerContent = () =>
    props.footerSlot !== undefined ? (
      <div data-slot="footer" class={resolvedClasses().footer}>
        {props.footerSlot}
      </div>
    ) : null

  return (
    <>
      <div
        data-dashboard-sidebar-overlay
        data-slot="overlay"
        class={`${resolvedClasses().overlay} fixed inset-0 z-40 bg-default/80 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileOpen() ? "block" : "hidden"
        } lg:hidden`}
        onClick={() => setMobileOpenState(false)}
      />

      <div
        data-dashboard-sidebar
        data-side={side()}
        data-collapsible={isCollapsible() ? "true" : "false"}
        data-collapsed={isCollapsible() && isCollapsed() ? "true" : "false"}
        data-mobile-open={isMobileOpen() ? "true" : "false"}
        data-slot="root"
        class={`${resolvedClasses().root} ${
          isMobileOpen()
            ? "!flex fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-default shadow-2xl border-e border-default"
            : "hidden lg:flex"
        }`}
        {...rest}
      >
        {headerContent()}

        <div data-slot="body" class={resolvedClasses().body}>
          {props.children}
        </div>

        {footerContent()}
      </div>
    </>
  )
}

export { RLDashboardSidebar }
export default RLDashboardSidebar
