import uiConfig from "virtual:rimelight/ui"
import {
  createMemo,
  createSignal,
  For,
  onSettled,
  onCleanup,
  Show,
  omit,
  type Component
} from "solid-js"
import { Portal } from "@solidjs/web"
import { activeShortcutsStore, defineShortcuts, type RegisteredShortcut } from "../../shortcuts"
import { shortcutsTheme } from "./shortcuts.theme"
import RLIcon from "../icon/RLIcon"
import RLKbd from "../kbd/RLKbd"

export interface RLShortcutsProps {
  categories?: Record<string, string>
  ui?: any
  class?: string
}

interface CategorySection {
  key: string
  label: string
  items: RegisteredShortcut[]
}

const modalId = `rl-shortcuts-${Math.random().toString(36).substring(2, 9)}`

const RLShortcuts: Component<RLShortcutsProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "categories", "ui", "class")

  const configCategories = (): Record<string, { label: string }> =>
    uiConfig.shortcuts?.categories || {}

  const resolvedCategories = createMemo<Record<string, string>>(() => {
    const configKeys = Object.keys(configCategories())
    const allKeys = [...new Set([...configKeys, ...Object.keys(props.categories || {})])]
    const resolved: Record<string, string> = {}
    allKeys.forEach((key) => {
      resolved[key] = props.categories?.[key] || configCategories()[key]?.label || key
    })
    return resolved
  })

  const categoryOrder = createMemo(() => Object.keys(configCategories()))

  const [isOpen, setIsOpen] = createSignal(false)
  const [shortcuts, setShortcuts] = createSignal<RegisteredShortcut[]>([])

  const openHelp = () => {
    setIsOpen(true)
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden"
    }
  }

  const closeHelp = () => {
    setIsOpen(false)
    if (typeof document !== "undefined") {
      document.body.style.overflow = ""
    }
  }

  onSettled(() => {
    const unsubscribe = activeShortcutsStore.subscribe((list) => {
      setShortcuts([...list])
    })
    onCleanup(unsubscribe)
  })

  onSettled(() => {
    const handleOpenHelp = () => openHelp()
    document.addEventListener("rl-shortcuts:open", handleOpenHelp)
    document.addEventListener("rla-shortcuts:open", handleOpenHelp)
    document.addEventListener("shortcuts:open", handleOpenHelp)

    const qShortcutCleanup = defineShortcuts({
      "?": {
        handler: () => {
          if (isOpen()) {
            closeHelp()
          } else {
            openHelp()
          }
        },
        label: "Show Keyboard Shortcuts",
        description: "Display this shortcuts help cheat sheet modal",
        category: "system",
        order: 0
      }
    })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        closeHelp()
      }
    }
    window.addEventListener("keydown", onKeyDown)

    onCleanup(() => {
      document.removeEventListener("rl-shortcuts:open", handleOpenHelp)
      document.removeEventListener("rla-shortcuts:open", handleOpenHelp)
      document.removeEventListener("shortcuts:open", handleOpenHelp)
      window.removeEventListener("keydown", onKeyDown)
      if (typeof document !== "undefined") {
        document.body.style.overflow = ""
      }
      qShortcutCleanup()
    })
  })

  const resolvedClasses = createMemo(() =>
    shortcutsTheme({
      ui: props.ui,
      class: props.class
    })
  )

  const sections = createMemo<CategorySection[]>(() => {
    const list = shortcuts()
    if (list.length === 0) return []

    const grouped: Record<string, RegisteredShortcut[]> = {}
    list.forEach((shortcut) => {
      const cat = (shortcut.category || "system").toLowerCase()
      const arr = grouped[cat]
      if (arr) {
        arr.push(shortcut)
      } else {
        grouped[cat] = [shortcut]
      }
    })

    const sortedKeys = Object.keys(grouped).sort((keyA, keyB) => {
      const indexA = categoryOrder().indexOf(keyA)
      const indexB = categoryOrder().indexOf(keyB)

      if (indexA !== -1 && indexB !== -1) return indexA - indexB
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1

      const labelA = resolvedCategories()[keyA] || keyA
      const labelB = resolvedCategories()[keyB] || keyB
      return labelA.localeCompare(labelB)
    })

    return sortedKeys.map((key) => {
      const group = grouped[key] || []
      group.sort((a, b) => {
        const orderA = a.order ?? -1
        const orderB = b.order ?? -1
        if (orderA !== orderB) return orderB - orderA
        const labelA = a.label || a.id
        const labelB = b.label || b.id
        return labelA.localeCompare(labelB)
      })
      return { key, label: resolvedCategories()[key] || key, items: group }
    })
  })

  return (
    <Show when={isOpen()}>
      <Portal>
        <div
          class={resolvedClasses().modal}
          data-slot="modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeHelp()
          }}
          {...rest}
        >
          <div
            id={modalId}
            class={resolvedClasses().dialog}
            data-slot="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${modalId}-title`}
          >
            <div class={resolvedClasses().header} data-slot="header">
              <h3 id={`${modalId}-title`} class={resolvedClasses().title} data-slot="title">
                Keyboard Shortcuts
              </h3>
              <button
                type="button"
                class={resolvedClasses().close}
                aria-label="Close shortcuts help"
                onClick={closeHelp}
                data-slot="close"
              >
                <RLIcon name="close" class="size-4" />
              </button>
            </div>

            <div class={resolvedClasses().body} data-slot="body">
              <Show
                when={shortcuts().length > 0}
                fallback={
                  <div class={resolvedClasses().empty} data-slot="empty">
                    No active shortcuts found on this page.
                  </div>
                }
              >
                <For each={sections()}>
                  {(section) => (
                    <div class={resolvedClasses().categorySection} data-slot="category-section">
                      <h4 class={resolvedClasses().categoryTitle} data-slot="category-title">
                        {section.label}
                      </h4>
                      <div class={resolvedClasses().grid} data-slot="grid">
                        <For each={section.items}>
                          {(shortcut) => (
                            <div class={resolvedClasses().row} data-slot="row">
                              <div class={resolvedClasses().info} data-slot="info">
                                <span class={resolvedClasses().name} data-slot="name">
                                  {shortcut.label || shortcut.id}
                                </span>
                                <Show when={shortcut.description}>
                                  <span class={resolvedClasses().desc} data-slot="desc">
                                    {shortcut.description}
                                  </span>
                                </Show>
                              </div>
                              <div class={resolvedClasses().keys} data-slot="keys">
                                <For each={shortcut.keys}>
                                  {(key) => <RLKbd size="sm">{key}</RLKbd>}
                                </For>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  )}
                </For>
              </Show>
            </div>

            <div class={resolvedClasses().footer} data-slot="footer">
              <span class="flex items-center gap-1">
                Press <RLKbd size="sm">?</RLKbd> or <RLKbd size="sm">Esc</RLKbd> to close
              </span>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  )
}

export { RLShortcuts }
export default RLShortcuts
