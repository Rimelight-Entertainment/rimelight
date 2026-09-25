import { createMemo, For, Show, splitProps, type Component, type JSX } from "solid-js"
import type { SidebarItem, SidebarProps } from "./sidebar"
import { sidebarTheme } from "./sidebar.theme"
import RLBadge from "../badge/RLBadge"
import RLIcon from "../icon/RLIcon"

export interface RLSidebarProps extends SidebarProps {
  children?: JSX.Element
  header?: JSX.Element
  headerSlot?: JSX.Element
  footer?: JSX.Element
  footerSlot?: JSX.Element
  _depth?: number
}

function hasActiveChild(item: SidebarItem): boolean {
  if (item.active) return true
  return (item.children ?? []).some((c) => hasActiveChild(c))
}

function normalizeBadge(badge: any) {
  if (!badge) return null
  if (typeof badge === "string") {
    return { text: badge, color: "primary" as const, variant: "soft" as const, class: "" }
  }
  let color = badge.color || "primary"
  let badgeVariant = badge.variant || "soft"
  if (badge.variant) {
    const v = String(badge.variant).toLowerCase()
    if (v === "tip" || v === "success") {
      color = "success"
      badgeVariant = "soft"
    } else if (v === "caution" || v === "warning") {
      color = "warning"
      badgeVariant = "soft"
    } else if (v === "error") {
      color = "error"
      badgeVariant = "soft"
    } else if (v === "note" || v === "default") {
      color = "primary"
      badgeVariant = "soft"
    }
  }
  return {
    text: badge.text || badge.label || "",
    color,
    variant: badgeVariant as "solid" | "outline" | "soft" | "ghost",
    class: badge.class || ""
  }
}

const RLSidebarItems: Component<{
  items: SidebarItem[]
  t: (key: string) => string
  _depth: number
  themeClasses: any
}> = (props) => {
  const indentClass = () => (props._depth === 0 ? "ml-6" : props._depth === 1 ? "ml-4" : "ml-3")
  const textSizeClass = () => (props._depth === 0 ? "" : "text-xs")

  return (
    <div class="flex flex-col gap-0.5">
      <For each={props.items}>
        {(item) => {
          const hasChildren = () => (item.children?.length ?? 0) > 0
          const isActive = () => item.active || hasActiveChild(item)
          const b = () => normalizeBadge(item.badge)

          return (
            <div
              class={props._depth === 1 ? props.themeClasses.item : ""}
              data-slot={props._depth === 1 ? "item" : undefined}
            >
              <Show
                when={hasChildren()}
                fallback={
                  <a
                    href={item.href ?? "#"}
                    class={`${
                      props._depth === 1
                        ? props.themeClasses.itemLink
                        : `flex items-center gap-1.5 w-full px-2 py-1 rounded-md text-muted hover:text-highlighted hover:bg-muted transition-colors ${textSizeClass()}`
                    } ${isActive() ? " text-highlighted bg-muted" : ""}`}
                    aria-current={isActive() ? "page" : undefined}
                  >
                    {item.icon && (
                      <span
                        class={`${
                          props._depth === 1 ? props.themeClasses.itemIcon : "size-3.5 shrink-0"
                        } ${item.icon}`}
                        aria-hidden="true"
                      />
                    )}
                    <span data-slot="item-text" class="truncate flex-1">
                      {props.t(item.label || "")}
                    </span>
                    {b() && (
                      <RLBadge
                        variant={b()!.variant}
                        color={b()!.color as any}
                        size="sm"
                        class={`ml-auto select-none ${b()!.class}`}
                        data-slot="item-badge"
                      >
                        {props.t(b()!.text)}
                      </RLBadge>
                    )}
                  </a>
                }
              >
                <details open={isActive()} class="group/details">
                  <summary
                    class={`${
                      props._depth === 1
                        ? props.themeClasses.itemLink
                        : `flex items-center gap-1.5 w-full px-2 py-1 rounded-md text-muted hover:text-highlighted hover:bg-muted transition-colors ${textSizeClass()}`
                    } ${isActive() ? " text-highlighted bg-muted" : ""} list-none cursor-pointer`}
                    data-slot="item-summary"
                  >
                    {item.icon && (
                      <span
                        class={`${
                          props._depth === 1 ? props.themeClasses.itemIcon : "size-3.5 shrink-0"
                        } ${item.icon}`}
                        aria-hidden="true"
                      />
                    )}
                    <span data-slot="item-text" class="truncate flex-1">
                      {props.t(item.label || "")}
                    </span>
                    {b() && (
                      <RLBadge
                        variant={b()!.variant}
                        color={b()!.color as any}
                        size="sm"
                        class={`ml-auto select-none ${b()!.class}`}
                        data-slot="item-badge"
                      >
                        {props.t(b()!.text)}
                      </RLBadge>
                    )}
                    <RLIcon
                      name="i-rl-chevronRight"
                      class="size-3 ml-auto transition-transform group-open/details:rotate-90"
                    />
                  </summary>
                  <div class={`mt-0.5 ${indentClass()} flex flex-col gap-0.5`}>
                    <RLSidebarItems
                      items={item.children ?? []}
                      t={props.t}
                      _depth={props._depth + 1}
                      themeClasses={props.themeClasses}
                    />
                  </div>
                </details>
              </Show>
            </div>
          )
        }}
      </For>
    </div>
  )
}

const RLSidebar: Component<RLSidebarProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "items",
    "collapsible",
    "variant",
    "logo",
    "t",
    "_depth",
    "ui",
    "class",
    "children",
    "header",
    "headerSlot",
    "footer",
    "footerSlot"
  ])

  const t = () => props.t ?? ((key: string) => key)
  const depth = () => props._depth ?? 0
  const items = () => props.items ?? []
  const isRoot = () => depth() === 0

  const resolvedClasses = createMemo(() =>
    sidebarTheme({
      collapsible: props.collapsible,
      variant: props.variant,
      ui: props.ui,
      class: props.class
    })
  )

  let sidebarRef: HTMLElement | null = null

  const toggleSidebar = () => {
    if (sidebarRef) {
      sidebarRef.classList.toggle("-translate-x-full")
    }
  }

  const headerContent = () =>
    props.header !== undefined ? (
      props.header
    ) : props.headerSlot !== undefined ? (
      props.headerSlot
    ) : props.logo ? (
      <span data-slot="sidebar-logo" class="flex items-center gap-2">
        <RLIcon name="i-rl-layers" class="size-5 text-primary" />
        <span class="truncate">{props.logo}</span>
      </span>
    ) : null

  const footerContent = () => (props.footer !== undefined ? props.footer : props.footerSlot)

  return (
    <Show
      when={isRoot()}
      fallback={
        <RLSidebarItems items={items()} t={t()} _depth={depth()} themeClasses={resolvedClasses()} />
      }
    >
      <aside
        ref={(el) => (sidebarRef = el)}
        class={resolvedClasses().root}
        data-slot="root"
        data-sidebar
        {...rest}
      >
        <div class={resolvedClasses().header} data-slot="header">
          {headerContent()}
        </div>

        <div class={resolvedClasses().content} data-slot="content">
          {props.children !== undefined ? (
            props.children
          ) : (
            <RLSidebarItems items={items()} t={t()} _depth={1} themeClasses={resolvedClasses()} />
          )}
        </div>

        {footerContent() !== undefined && (
          <div class={resolvedClasses().footer} data-slot="footer">
            {footerContent()}
          </div>
        )}
      </aside>

      <Show when={props.collapsible === "offcanvas"}>
        <button
          type="button"
          data-sidebar-toggle
          class="fixed top-4 left-4 z-50 flex size-9 items-center justify-center rounded-md bg-default border border-default shadow-sm hover:bg-muted transition-colors"
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
        >
          <RLIcon name="i-rl-panelLeft" class="size-4" />
        </button>
      </Show>
    </Show>
  )
}

export { RLSidebar }
export default RLSidebar
