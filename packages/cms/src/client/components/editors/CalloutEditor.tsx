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

const VARIANTS: Record<string, { icon: string; label: string }> = {
  info: { icon: "○", label: "Info" },
  success: { icon: "✓", label: "Success" },
  warning: { icon: "⚠", label: "Warning" },
  error: { icon: "✕", label: "Error" },
  commentary: { icon: "💬", label: "Commentary" },
  ideation: { icon: "💡", label: "Ideation" },
  source: { icon: "<>", label: "Source" }
}

export const CalloutEditor: Component<CalloutEditorProps> = (componentProps) => {
  const [linkSettingsOpen, setLinkSettingsOpen] = createSignal(!!componentProps.props.to)
  let childrenContainer: HTMLDivElement | undefined = undefined
  let toInput: HTMLInputElement | undefined = undefined
  let targetSelect: HTMLSelectElement | undefined = undefined
  let sortableInstance: any = null

  const variant = () => componentProps.props.variant || "info"

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

    onCleanup(() => {
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
  }

  return (
    <div class="w-full flex flex-col gap-3 border border-default rounded-xl p-4 bg-white dark:bg-neutral-900 shadow-sm">
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 cursor-pointer">
          <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Callout Type:
          </span>
          <select
            value={variant()}
            onChange={(e) => setVariant(e.currentTarget.value)}
            class="bg-neutral-100 dark:bg-neutral-800 border border-default rounded px-2 py-1 text-xs font-medium focus:outline-none text-foreground cursor-pointer"
          >
            <For each={Object.entries(VARIANTS)}>
              {([key, itemConfig]) => <option value={key}>{itemConfig.label}</option>}
            </For>
          </select>
        </label>

        <button
          type="button"
          onClick={() => setLinkSettingsOpen(!linkSettingsOpen())}
          class="text-xs text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none flex items-center gap-1"
          title="Link settings"
        >
          <span>🔗</span>
          <span>{componentProps.props.to ? "Linked" : "Add Link"}</span>
        </button>
      </div>

      <Show when={linkSettingsOpen()}>
        <div class="flex items-center gap-2 p-2 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg border border-default text-xs">
          <input
            ref={(el) => (toInput = el)}
            type="text"
            placeholder="Link URL (e.g. https://... or /slug)"
            value={componentProps.props.to || ""}
            onBlur={saveLinkProps}
            class="flex-1 bg-white dark:bg-neutral-900 border border-default text-foreground px-2 py-1 rounded outline-none"
          />
          <select
            ref={(el) => (targetSelect = el)}
            value={componentProps.props.target || "_self"}
            onChange={saveLinkProps}
            class="bg-white dark:bg-neutral-900 border border-default text-foreground px-2 py-1 rounded outline-none"
          >
            <option value="_self">Same tab</option>
            <option value="_blank">New tab (_blank)</option>
          </select>
        </div>
      </Show>

      <div
        ref={(el) => (childrenContainer = el)}
        class="p-3 rounded-lg border border-dashed border-default flex flex-col gap-2 min-h-[36px]"
      >
        {childrenBlocks().length === 0 ? (
          <div class="text-center py-2">
            <span class="text-xs text-muted-foreground block">Empty callout</span>
            <button
              type="button"
              onClick={() => componentProps.onOpenPicker?.()}
              class="mt-1 text-xs text-primary font-medium hover:underline cursor-pointer bg-transparent border-none"
            >
              + Add block
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
  )
}
