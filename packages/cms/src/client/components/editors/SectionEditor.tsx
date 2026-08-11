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

  const displayLevel = () => Math.min((componentProps.sectionDepth || 0) + 1, 6)
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
          // Intentionally empty: the target container's onAdd -> relocateBlock
          // handles the full atomic move atomically (remove source + insert destination).
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
    <div class="rimelight-section-editor flex flex-col gap-3 w-full">
      <div class="flex items-center gap-2 w-full">
        <div class="level-badge text-xs font-mono text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded shrink-0">
          H{displayLevel()}
        </div>
        <input
          ref={(el) => (titleInput = el)}
          type="text"
          data-field="title"
          value={componentProps.props.title || ""}
          onInput={saveProps}
          placeholder="Section Title"
          class="title-input flex-1 w-full min-w-0 bg-transparent border-b border-gray-700 text-gray-100 font-semibold outline-none py-1 focus:border-blue-500 text-lg"
          classList={{ "text-xl": displayLevel() <= 2 }}
        />
      </div>
      <input
        ref={(el) => (descInput = el)}
        type="text"
        data-field="description"
        value={componentProps.props.description || ""}
        onInput={saveProps}
        placeholder="Optional description..."
        class="desc-input w-full min-w-0 bg-transparent border-b border-gray-700 text-gray-400 text-sm outline-none py-1 focus:border-blue-500"
      />
      <hr class="border-t border-gray-800 my-1" />
      <div
        ref={(el) => (childrenContainer = el)}
        class="children-container flex flex-col gap-2 min-h-[48px] pl-4 border-l-2 border-gray-700"
      >
        {childrenBlocks().length === 0 ? (
          <div class="cms-empty-placeholder relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-gray-800/80 bg-gray-900/30 text-center my-1">
            <div class="text-xs font-semibold text-gray-300">Empty section</div>
            <p class="text-[11px] text-gray-500">Drag blocks here or click below to add content</p>
            <button
              type="button"
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                componentProps.onOpenPicker?.()
              }}
              class="cms-add-child-block mt-1 px-3 py-1.5 bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-medium rounded-md cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1"
            >
              + Add Block
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
      <button
        type="button"
        onClick={() => componentProps.onOpenPicker?.()}
        class="add-btn text-xs text-gray-500 hover:text-blue-400 flex items-center gap-1 py-2 cursor-pointer bg-transparent border-none w-fit"
      >
        <span>+</span> Add block
      </button>
    </div>
  )
}
