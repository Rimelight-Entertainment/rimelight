import {
  createMemo,
  createSignal,
  splitProps,
  For,
  onCleanup,
  type Component,
  type JSX
} from "solid-js"
import type {
  NavigationMenuItem,
  NavigationMenuChildItem,
  NavigationMenuProps
} from "./navigation-menu"
import { navigationMenuTheme } from "./navigation-menu.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSNavigationMenuProps extends NavigationMenuProps {
  children?: JSX.Element
}

const RLSNavigationMenu: Component<RLSNavigationMenuProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "items",
    "color",
    "orientation",
    "theme",
    "ui",
    "class",
    "children"
  ])

  const [openIndex, setOpenIndex] = createSignal<number | null>(null)

  const items = createMemo(() => props.items ?? [])

  const orientation = () => props.orientation ?? "horizontal"

  const resolvedClasses = createMemo(() =>
    navigationMenuTheme({
      color: props.color ?? "primary",
      orientation: orientation(),
      ui: props.ui,
      class: props.class
    })
  )

  const currentPath = () => {
    if (typeof window === "undefined") return ""
    return (
      window.location.pathname
        .replace(/^\/[a-z]{2}(?:-[a-zA-Z]{2})?(?=\/|$)/, "")
        .replace(/\/+$/, "") || "/"
    )
  }

  const isItemActive = (item: NavigationMenuItem) => {
    if (item["active"] !== undefined) return !!item["active"]
    const rawPath = (item["href"] ?? (item["to"] as string | undefined) ?? "#") as string
    const normalizedPath =
      rawPath.replace(/^\/[a-z]{2}(?:-[a-zA-Z]{2})?(?=\/|$)/, "").replace(/\/+$/, "") || "/"
    const path = currentPath()
    if (normalizedPath !== "" && normalizedPath !== "/") return path.startsWith(normalizedPath)
    return path === "/"
  }

  let closeTimer: ReturnType<typeof setTimeout> | undefined

  const openItem = (index: number) => {
    if (closeTimer) clearTimeout(closeTimer)
    setOpenIndex(index)
  }

  const closeAll = () => {
    if (closeTimer) clearTimeout(closeTimer)
    setOpenIndex(null)
  }

  const scheduleClose = () => {
    if (closeTimer) clearTimeout(closeTimer)
    closeTimer = setTimeout(() => {
      setOpenIndex(null)
    }, 150)
  }

  onCleanup(() => {
    if (closeTimer) clearTimeout(closeTimer)
  })

  const itemHref = (item: NavigationMenuItem) =>
    typeof item["href"] === "string" ? item["href"] : typeof item["to"] === "string" ? item["to"] : "#"

  const childHref = (child: NavigationMenuChildItem) =>
    typeof child["href"] === "string"
      ? child["href"]
      : typeof child["to"] === "string"
        ? child["to"]
        : "#"

  return (
    <nav
      class={resolvedClasses().root}
      data-slot="root"
      data-nav-menu
      data-orientation={orientation()}
      {...rest}
    >
      <ul class={resolvedClasses().list} data-slot="list" role="list">
        <For each={items()}>
          {(item, i) => {
            const hasChildren = () => !!(item.children && item.children.length > 0)
            const isActive = () => isItemActive(item)
            const isOpen = () => openIndex() === i()

            return (
              <li
                class={resolvedClasses().item}
                data-slot="item"
                data-nav-item
                data-index={i()}
                onMouseEnter={() => {
                  if (orientation() === "horizontal" && hasChildren()) openItem(i())
                }}
                onMouseLeave={() => {
                  if (orientation() === "horizontal" && hasChildren()) scheduleClose()
                }}
              >
                {hasChildren() ? (
                  <button
                    type="button"
                    class={resolvedClasses().trigger}
                    data-slot="trigger"
                    data-nav-trigger
                    aria-expanded={isOpen() ? "true" : "false"}
                    aria-haspopup="true"
                    data-state={isOpen() ? "open" : "closed"}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isOpen()) {
                        closeAll()
                      } else {
                        openItem(i())
                      }
                    }}
                  >
                    {item.icon && <span class={`${item.icon} mr-1.5 size-4`} aria-hidden="true" />}
                    {item.label}
                    <RLSIcon
                      name="chevronDown"
                      class={`ml-1 size-3.5 transition-transform duration-200 ${isOpen() ? "rotate-180" : ""}`}
                      aria-hidden="true"
                      data-chevron
                    />
                  </button>
                ) : (
                  <a
                    href={itemHref(item)}
                    class={resolvedClasses().link}
                    data-slot="link"
                    aria-current={isActive() ? "page" : undefined}
                  >
                    {item.icon && <span class={`${item.icon} mr-1.5 size-4`} aria-hidden="true" />}
                    {item.label}
                  </a>
                )}

                {hasChildren() ? (
                  <div
                    class={`${resolvedClasses().content} ${isOpen() ? "" : "hidden"}`}
                    data-slot="content"
                    data-nav-content
                    data-item-index={i()}
                    role="region"
                  >
                    <ul role="list" class="py-1">
                      <For each={item.children}>
                        {(child) => (
                          <li>
                            <a
                              href={childHref(child)}
                              class="flex items-start gap-3 rounded-sm px-3 py-2 text-sm hover:bg-accented hover:text-highlighted transition-colors"
                            >
                              {child["icon"] && (
                                <span
                                  class={`${child["icon"]} mt-0.5 size-4 shrink-0 text-muted`}
                                  aria-hidden="true"
                                />
                              )}
                              <div>
                                <div class="font-medium leading-none">{child["label"]}</div>
                                {child["description"] && (
                                  <p class="mt-1 text-xs text-muted line-clamp-2">
                                    {child["description"]}
                                  </p>
                                )}
                              </div>
                            </a>
                          </li>
                        )}
                      </For>
                    </ul>
                  </div>
                ) : null}
              </li>
            )
          }}
        </For>
      </ul>

      {props.children}

      <div
        class={`${resolvedClasses().viewportWrapper} hidden`}
        data-slot="viewport-wrapper"
        data-nav-viewport-wrapper
      >
        <div class={resolvedClasses().viewport} data-slot="viewport" data-nav-viewport />
      </div>
    </nav>
  )
}

export default RLSNavigationMenu
