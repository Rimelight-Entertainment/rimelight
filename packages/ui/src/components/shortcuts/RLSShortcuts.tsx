import uiConfig from "virtual:rimelight/ui"
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onMount,
  onCleanup,
  Show,
  splitProps,
  type Component
} from "solid-js"
import { activeShortcutsStore, defineShortcuts, type RegisteredShortcut } from "../../shortcuts"
import RLSIcon from "../icon/RLSIcon"

export interface RLSShortcutsProps {
  categories?: Record<string, string>
}

interface CategorySection {
  key: string
  label: string
  items: RegisteredShortcut[]
}

const modalId = `rla-shortcuts-${Math.random().toString(36).substring(2, 9)}`

const RLSShortcuts: Component<RLSShortcutsProps> = (allProps) => {
  const [props] = splitProps(allProps, ["categories"])

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
  let dialogRef: HTMLDialogElement | undefined

  const openHelp = () => setIsOpen(true)
  const closeHelp = () => setIsOpen(false)

  onMount(() => {
    const unsubscribe = activeShortcutsStore.subscribe((list) => {
      setShortcuts([...list])
    })
    onCleanup(unsubscribe)
  })

  createEffect(() => {
    const dialog = dialogRef
    if (!dialog) return
    if (isOpen()) {
      if (!dialog.open) dialog.showModal()
      document.body.style.overflow = "hidden"
    } else {
      if (dialog.open) dialog.close()
      document.body.style.overflow = ""
    }
  })

  onMount(() => {
    const dialog = dialogRef
    if (!dialog) return

    const onDialogClick = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect()
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      if (!isInDialog) closeHelp()
    }
    dialog.addEventListener("click", onDialogClick)
    onCleanup(() => dialog.removeEventListener("click", onDialogClick))
  })

  onMount(() => {
    const qShortcutCleanup = defineShortcuts({
      "?": {
        handler: () => {
          if (dialogRef?.open) {
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
    onCleanup(qShortcutCleanup)
  })

  createEffect(() => {
    if (!isOpen()) return
    const cleanup = defineShortcuts({
      "escape": {
        handler: () => closeHelp(),
        usingInput: true
      },
      "?": {
        handler: () => closeHelp(),
        usingInput: true
      }
    })
    onCleanup(cleanup)
  })

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
    <>
      <dialog
        ref={(el) => (dialogRef = el)}
        id={modalId}
        class="rla-shortcuts-dialog"
        tabIndex={-1}
        aria-labelledby={`${modalId}-title`}
      >
        <div class="rla-shortcuts-content">
          <div class="rla-shortcuts-header">
            <h3 id={`${modalId}-title`} class="rla-shortcuts-title">
              Keyboard Shortcuts
            </h3>
            <button
              type="button"
              class="rla-shortcuts-close"
              aria-label="Close shortcuts help"
              onClick={closeHelp}
            >
              <RLSIcon name="close" class="size-4" />
            </button>
          </div>

          <div class="rla-shortcuts-body">
            <Show
              when={shortcuts().length > 0}
              fallback={
                <div class="rla-shortcuts-empty">No active shortcuts found on this page.</div>
              }
            >
              <For each={sections()}>
                {(section) => (
                  <div class="rla-shortcuts-category-section">
                    <h4 class="rla-shortcuts-category-title">{section.label}</h4>
                    <div class="rla-shortcuts-grid">
                      <For each={section.items}>
                        {(shortcut) => (
                          <div class="rla-shortcuts-row">
                            <div class="rla-shortcuts-info">
                              <span class="rla-shortcuts-name">
                                {shortcut.label || shortcut.id}
                              </span>
                              <Show when={shortcut.description}>
                                <span class="rla-shortcuts-desc">{shortcut.description}</span>
                              </Show>
                            </div>
                            <div class="rla-shortcuts-keys">
                              <For each={shortcut.keys}>
                                {(key) => <kbd class="rla-shortcuts-kbd">{key}</kbd>}
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

          <div class="rla-shortcuts-footer">
            <span>
              Press <kbd class="rla-shortcuts-kbd-footer">?</kbd> to close
            </span>
          </div>
        </div>
      </dialog>

      <style>{`
        .rla-shortcuts-dialog {
          border: 1px solid #27272a !important;
          background: #18181b !important;
          color: #fff !important;
          border-radius: 12px;
          padding: 0;
          max-width: 520px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          outline: none;
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 50;
          margin: 0;
        }
        .rla-shortcuts-dialog::backdrop {
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        .rla-shortcuts-content {
          display: flex;
          flex-direction: column;
        }
        .rla-shortcuts-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #27272a;
        }
        .rla-shortcuts-title {
          margin: 0 !important;
          font-size: 1.125rem !important;
          font-weight: 600 !important;
          color: #ffffff !important;
        }
        .rla-shortcuts-close {
          background: transparent;
          border: none;
          color: var(--rl-neutral-400, #a3a3a3);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s, background-color 0.15s;
        }
        .rla-shortcuts-close:hover {
          color: #fff;
          background-color: var(--rl-neutral-800, #262626);
        }
        .rla-shortcuts-close:focus {
          outline: none !important;
        }
        .rla-shortcuts-close:focus-visible {
          outline: 2px solid var(--rl-primary-500, #3b82f6) !important;
        }
        .rla-shortcuts-body {
          padding: 20px;
          max-height: 380px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .rla-shortcuts-category-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rla-shortcuts-category-title {
          margin: 0;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--rl-primary-500, #3b82f6);
          font-weight: 700;
        }
        .rla-shortcuts-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rla-shortcuts-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(38, 38, 38, 0.4);
        }
        .rla-shortcuts-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .rla-shortcuts-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #f5f5f5;
        }
        .rla-shortcuts-desc {
          font-size: 0.75rem;
          color: var(--rl-neutral-400, #a3a3a3);
        }
        .rla-shortcuts-keys {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .rla-shortcuts-kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 600;
          background-color: #27272a !important;
          border: 1px solid #3f3f46 !important;
          border-radius: 4px;
          padding: 2px 6px;
          min-width: 20px;
          color: #a3a3a3 !important;
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
        }
        .rla-shortcuts-empty {
          font-size: 0.875rem;
          color: var(--rl-neutral-500, #737373);
          text-align: center;
          padding: 16px 0;
        }
        .rla-shortcuts-footer {
          padding: 12px 20px;
          background-color: #09090b !important;
          border-top: 1px solid #27272a;
          font-size: 0.75rem;
          color: var(--rl-neutral-400, #a3a3a3);
          display: flex;
          justify-content: flex-end;
        }
        .rla-shortcuts-kbd-footer {
          background-color: #27272a !important;
          border: 1px solid #3f3f46 !important;
          border-radius: 3px;
          padding: 1px 4px;
          font-size: 0.7rem;
          color: #a3a3a3 !important;
        }
      `}</style>
    </>
  )
}

export default RLSShortcuts
