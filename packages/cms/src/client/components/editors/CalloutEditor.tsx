import { createSignal, onMount, onCleanup, For, Show, type Component } from "solid-js"
import type { BaseBlock } from "../../../core/types/blocks"
import { initBlockSortable, cleanAllSortableClasses } from "../../utils/sortable"

export interface CalloutEditorProps {
  blockId?: string
  props: Record<string, any>
  children?: BaseBlock[] | (() => BaseBlock[])
  sectionDepth?: number
  onPropsChange: (newProps: Record<string, any>) => void
  onRelocate?: ((id: string, newIndex: number, targetParentId?: string | null) => void) | undefined
  onOpenPicker?: () => void
  renderChildBlock?: (block: BaseBlock, depth: number) => any
}

const VARIANTS: Record<string, { icon: string; color: string; label: string }> = {
  info: { icon: "○", color: "blue", label: "Info" },
  success: { icon: "✓", color: "green", label: "Success" },
  warning: { icon: "⚠", color: "amber", label: "Warning" },
  error: { icon: "✕", color: "red", label: "Error" },
  commentary: { icon: "💬", color: "gray", label: "Commentary" },
  ideation: { icon: "💡", color: "purple", label: "Ideation" },
  source: { icon: "<>", color: "teal", label: "Source" }
}

export const CalloutEditor: Component<CalloutEditorProps> = (componentProps) => {
  const [dropdownOpen, setDropdownOpen] = createSignal(false)
  const [linkSettingsOpen, setLinkSettingsOpen] = createSignal(!!componentProps.props.to)
  let childrenContainer: HTMLDivElement | undefined = undefined
  let toInput: HTMLInputElement | undefined = undefined
  let targetSelect: HTMLSelectElement | undefined = undefined
  let sortableInstance: any = null

  const variant = () => componentProps.props.variant || "info"
  const config = () => VARIANTS[variant()] || VARIANTS.info

  const childrenBlocks = (): BaseBlock[] => {
    if (typeof componentProps.children === "function") {
      return componentProps.children() || []
    }
    return componentProps.children || componentProps.props.children || []
  }

  onMount(() => {
    if (childrenContainer) {
      sortableInstance = initBlockSortable(childrenContainer, {
        filter: ".cms-empty-placeholder, .locked",
        onReorder: (oldIdx: number, newIdx: number) => {
          cleanAllSortableClasses()
          const list = [...childrenBlocks()]
          const item = list.splice(oldIdx, 1)[0]
          if (item) {
            list.splice(newIdx, 0, item)
            componentProps.onPropsChange({ ...componentProps.props, children: list })
          }
          requestAnimationFrame(() => cleanAllSortableClasses())
          setTimeout(cleanAllSortableClasses, 50)
          setTimeout(cleanAllSortableClasses, 200)
        },
        onAdd: (blockId: string, newIdx: number) => {
          cleanAllSortableClasses()
          if (componentProps.onRelocate && componentProps.blockId) {
            componentProps.onRelocate(blockId, newIdx, componentProps.blockId)
          }
          requestAnimationFrame(() => cleanAllSortableClasses())
          setTimeout(cleanAllSortableClasses, 50)
          setTimeout(cleanAllSortableClasses, 200)
        },
        onRemove: (_blockId: string, _oldIdx: number) => {
          cleanAllSortableClasses()
        }
      })
    }

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null
      if (dropdownOpen() && target && !target.closest(".callout-dropdown-wrapper")) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("click", handleOutsideClick)
    onCleanup(() => {
      document.removeEventListener("click", handleOutsideClick)
      if (sortableInstance) sortableInstance.destroy()
    })
  })

  const saveLinkProps = () => {
    componentProps.onPropsChange({
      ...componentProps.props,
      to: toInput?.value || undefined,
      target: targetSelect?.value || undefined
    })
  }

  const setVariant = (v: string) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      variant: v
    })
    setDropdownOpen(false)
  }

  const borderClass = () => {
    switch (variant()) {
      case "info":
        return "border-blue-700 bg-blue-950/20"
      case "success":
        return "border-green-700 bg-green-950/20"
      case "warning":
        return "border-amber-700 bg-amber-950/20"
      case "error":
        return "border-red-700 bg-red-950/20"
      case "commentary":
        return "border-gray-700 bg-gray-900/20"
      case "ideation":
        return "border-purple-700 bg-purple-950/20"
      case "source":
        return "border-teal-700 bg-teal-950/20"
      default:
        return "border-blue-700 bg-blue-950/20"
    }
  }

  const iconClass = () => {
    switch (variant()) {
      case "info":
        return "text-blue-400"
      case "success":
        return "text-green-400"
      case "warning":
        return "text-amber-400"
      case "error":
        return "text-red-400"
      case "commentary":
        return "text-gray-400"
      case "ideation":
        return "text-purple-400"
      case "source":
        return "text-teal-400"
      default:
        return "text-blue-400"
    }
  }

  return (
    <div
      class={`rimelight-callout-editor flex flex-col gap-2 p-4 rounded-lg border my-1 relative transition-colors w-full ${borderClass()}`}
    >
      <div class="flex items-center justify-between w-full">
        <div class="callout-dropdown-wrapper relative flex items-center gap-2">
          <button
            type="button"
            class={`callout-icon-btn text-xl cursor-pointer select-none leading-none bg-transparent border-none p-0 ${iconClass()}`}
            onClick={(e) => {
              e.stopPropagation()
              setDropdownOpen(!dropdownOpen())
            }}
          >
            {config()?.icon}
          </button>
          <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {config()?.label}
          </span>

          {dropdownOpen() && (
            <div class="callout-dropdown absolute left-0 top-8 z-50 w-52 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-1 flex flex-col gap-1">
              <For each={Object.entries(VARIANTS)}>
                {([key, itemConfig]: [string, { icon: string; color: string; label: string }]) => (
                  <button
                    type="button"
                    data-variant={key}
                    onClick={() => setVariant(key)}
                    class="variant-item flex items-center gap-2 w-full px-3 py-2 rounded text-sm hover:bg-gray-800 cursor-pointer text-gray-300 bg-transparent border-none text-left"
                  >
                    <span class="text-lg w-6 text-center">{itemConfig.icon}</span>
                    <span>{itemConfig.label}</span>
                  </button>
                )}
              </For>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setLinkSettingsOpen(!linkSettingsOpen())}
          class="text-xs text-gray-500 hover:text-gray-300 cursor-pointer bg-transparent border-none flex items-center gap-1"
          title="Link settings"
        >
          <span>🔗</span>
          <span>{componentProps.props.to ? "Linked" : "Add Link"}</span>
        </button>
      </div>

      <Show when={linkSettingsOpen()}>
        <div class="callout-link-settings flex items-center gap-2 p-2 bg-gray-900/60 rounded border border-gray-800 text-xs">
          <input
            ref={(el) => (toInput = el)}
            type="text"
            placeholder="Link URL (e.g. https://... or /slug)"
            value={componentProps.props.to || ""}
            onBlur={saveLinkProps}
            class="flex-1 bg-gray-800 border border-gray-700 text-gray-200 px-2 py-1 rounded outline-none"
          />
          <select
            ref={(el) => (targetSelect = el)}
            value={componentProps.props.target || "_self"}
            onChange={saveLinkProps}
            class="bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1 rounded outline-none"
          >
            <option value="_self">Same tab</option>
            <option value="_blank">New tab (_blank)</option>
          </select>
        </div>
      </Show>

      <div class="flex-1 min-w-0 flex flex-col gap-2 mt-1">
        <div ref={childrenContainer} class="children-container flex flex-col gap-2">
          {childrenBlocks().length === 0 ? (
            <div class="cms-empty-placeholder relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-800/80 bg-gray-900/20 text-center my-1">
              <div class="text-xs font-semibold text-gray-300">Empty callout</div>
              <p class="text-[11px] text-gray-500">
                Drag blocks here or click below to add content
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  componentProps.onOpenPicker?.()
                }}
                class="cms-add-child-block mt-1 px-3 py-1 bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-medium rounded-md cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1"
              >
                + Add Block
              </button>
            </div>
          ) : (
            <For each={childrenBlocks()}>
              {(childBlock) =>
                componentProps.renderChildBlock?.(childBlock, componentProps.sectionDepth || 0)
              }
            </For>
          )}
        </div>
      </div>
    </div>
  )
}
