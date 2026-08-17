import {
  createSignal,
  createMemo,
  splitProps,
  onMount,
  onCleanup,
  For,
  Show,
  type Component,
  type JSX
} from "solid-js"
import type { DropdownMenuProps, DropdownMenuItem } from "./dropdown-menu"
import { dropdownMenuTheme } from "./dropdown-menu.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSDropdownMenuProps extends DropdownMenuProps {
  children?: JSX.Element
  trigger?: JSX.Element
}

const RLSDropdownMenu: Component<RLSDropdownMenuProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "items",
    "label",
    "icon",
    "size",
    "color",
    "arrow",
    "content",
    "disabled",
    "ui",
    "class",
    "children",
    "trigger"
  ])

  const [isOpen, setIsOpen] = createSignal(false)
  let menuContainer: HTMLDivElement | undefined

  onMount(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen() && menuContainer && !menuContainer.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("click", handleOutsideClick)
    onCleanup(() => document.removeEventListener("click", handleOutsideClick))
  })

  const resolvedClasses = createMemo(() =>
    dropdownMenuTheme({
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class
    })
  )

  const itemGroups = createMemo<DropdownMenuItem[][]>(() => {
    if (!props.items) return []
    if (props.items.length > 0 && Array.isArray(props.items[0])) {
      return props.items as DropdownMenuItem[][]
    }
    return [props.items as DropdownMenuItem[]]
  })

  const alignClass = () => {
    const align = props.content?.align || "start"
    if (align === "end") return "right-0"
    if (align === "center") return "left-1/2 -translate-x-1/2"
    return "left-0"
  }

  return (
    <div
      ref={(el) => (menuContainer = el)}
      class={resolvedClasses().root}
      data-slot="root"
      {...rest}
    >
      <button
        type="button"
        disabled={props.disabled}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen())
        }}
        class={resolvedClasses().trigger}
        data-slot="trigger"
      >
        {props.trigger ? (
          props.trigger
        ) : props.children ? (
          props.children
        ) : (
          <>
            {props.icon && <RLSIcon name={props.icon} size="sm" class="shrink-0" />}
            {props.label && <span>{props.label}</span>}
            {!props.icon && !props.label && <RLSIcon name="ellipsisVertical" size="sm" />}
          </>
        )}
      </button>

      <Show when={isOpen()}>
        <div
          class={`${resolvedClasses().content}  ${alignClass()}`}
          data-slot="content"
          role="menu"
        >
          {props.arrow && <div class={resolvedClasses().arrow} />}
          <div class={resolvedClasses().viewport}>
            <For each={itemGroups()}>
              {(group, groupIdx) => (
                <div class={resolvedClasses().group}>
                  {groupIdx() > 0 && <div class={resolvedClasses().separator} />}
                  <For each={group}>
                    {(item) => {
                      if (item.type === "separator") {
                        return <div class={resolvedClasses().separator} />
                      }
                      if (item.type === "label") {
                        return <div class={resolvedClasses().label}>{item.label}</div>
                      }

                      const itemColor = () =>
                        item.color === "error"
                          ? "text-destructive hover:bg-destructive/10"
                          : item.color === "primary"
                            ? "text-primary hover:bg-primary/10"
                            : ""

                      if (item.to) {
                        return (
                          <a
                            href={item.to}
                            target={item.target}
                            class={`${resolvedClasses().item}  ${itemColor()}  ${item.class || ""}`}
                            data-slot="item"
                            role="menuitem"
                            onClick={(e) => {
                              setIsOpen(false)
                              item.onSelect?.(e)
                            }}
                          >
                            {item.icon && (
                              <RLSIcon
                                name={item.icon}
                                size="sm"
                                class={resolvedClasses().itemLeadingIcon}
                              />
                            )}
                            <span class={resolvedClasses().itemLabel}>{item.label}</span>
                            {item.shortcut && (
                              <span class={resolvedClasses().shortcut}>{item.shortcut}</span>
                            )}
                          </a>
                        )
                      }

                      return (
                        <button
                          type="button"
                          disabled={item.disabled}
                          class={`${resolvedClasses().item}  ${itemColor()}  ${item.class || ""}`}
                          data-slot="item"
                          role="menuitem"
                          onClick={(e) => {
                            setIsOpen(false)
                            item.onSelect?.(e)
                          }}
                        >
                          {item.icon && (
                            <RLSIcon
                              name={item.icon}
                              size="sm"
                              class={resolvedClasses().itemLeadingIcon}
                            />
                          )}
                          <span class={resolvedClasses().itemLabel}>{item.label}</span>
                          {item.shortcut && (
                            <span class={resolvedClasses().shortcut}>{item.shortcut}</span>
                          )}
                        </button>
                      )
                    }}
                  </For>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default RLSDropdownMenu
