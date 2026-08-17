import { onMount, onCleanup, For, type Component } from "solid-js"
import type { BaseBlock } from "../../../core/types/blocks"
import { initBlockSortable, cleanAllSortableClasses } from "../../utils/sortable"

export interface SectionEditorProps {
  blockId?: string
  props: Record<string, any>
  children?: BaseBlock[] | (() => BaseBlock[])
  sectionDepth?: number
  onPropsChange: (newProps: Record<string, any>) => void
  onRelocate?: ((id: string, newIndex: number, targetParentId?: string | null) => void) | undefined
  onOpenPicker?: () => void
  renderChildBlock?: (block: BaseBlock, depth: number) => any
}

export const SectionEditor: Component<SectionEditorProps> = (componentProps) => {
  let titleInput: HTMLInputElement | null = null as HTMLInputElement | null
  let descInput: HTMLInputElement | null = null as HTMLInputElement | null
  let childrenContainer: HTMLDivElement | null = null as HTMLDivElement | null
  let sortableInstance: any = null

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

  const saveProps = () => {
    componentProps.onPropsChange({
      ...componentProps.props,
      title: titleInput?.value || "",
      description: descInput?.value || "",
      children: childrenBlocks()
    })
  }

  return (
    <div class="w-full flex flex-col gap-4 border border-default rounded-xl p-4 bg-neutral-50/50 dark:bg-neutral-900/30">
      <div class="flex items-center gap-3">
        <select
          value={componentProps.props.level || (componentProps.sectionDepth || 0) + 1}
          onChange={(e) => {
            componentProps.onPropsChange({
              ...componentProps.props,
              level: Number(e.currentTarget.value)
            })
          }}
          class="bg-white dark:bg-neutral-800 border border-default rounded-lg px-2 py-1 text-xs font-bold focus:outline-none text-foreground cursor-pointer"
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
          <option value={4}>H4</option>
          <option value={5}>H5</option>
          <option value={6}>H6</option>
        </select>
        <input
          ref={(el) => (titleInput = el)}
          type="text"
          value={componentProps.props.title || ""}
          onInput={saveProps}
          placeholder="Section Title"
          class="flex-1 font-bold text-lg bg-transparent border-0 focus:outline-none text-foreground placeholder:text-muted-foreground/60"
        />
      </div>

      <input
        ref={(el) => (descInput = el)}
        type="text"
        value={componentProps.props.description || ""}
        onInput={saveProps}
        placeholder="Section description (optional)..."
        class="text-sm text-dimmed bg-transparent border-0 focus:outline-none placeholder:text-muted-foreground/50"
      />

      <div
        ref={(el) => (childrenContainer = el)}
        class="pl-4 border-l-2 border-primary/30 flex flex-col gap-4 mt-2 min-h-[32px]"
      >
        {childrenBlocks().length === 0 ? (
          <div class="flex flex-col items-center justify-center p-3 border border-dashed border-default rounded-lg text-center bg-white/40 dark:bg-neutral-900/40">
            <span class="text-xs text-muted-foreground">Empty section</span>
            <button
              type="button"
              onClick={() => componentProps.onOpenPicker?.()}
              class="mt-1 text-xs text-primary font-medium hover:underline cursor-pointer bg-transparent border-none"
            >
              + Add first block
            </button>
          </div>
        ) : (
          <For each={childrenBlocks()}>
            {(childBlock: BaseBlock) =>
              componentProps.renderChildBlock?.(childBlock, (componentProps.sectionDepth || 0) + 1)
            }
          </For>
        )}
      </div>

      <div class="flex items-center pt-1">
        <button
          type="button"
          onClick={() => componentProps.onOpenPicker?.()}
          class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer bg-transparent border-none py-1 transition-colors"
        >
          <span class="font-bold">+</span> Add block
        </button>
      </div>
    </div>
  )
}
