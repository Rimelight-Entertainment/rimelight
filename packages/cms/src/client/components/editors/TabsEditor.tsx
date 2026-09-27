import { onSettled, onCleanup, For, type Component } from "solid-js"
import type { BaseBlock } from "../../../core/types/blocks"
import { initBlockSortable, cleanAllSortableClasses } from "../../utils/sortable"
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx"

export interface TabsEditorProps {
  blockId?: string
  props: Record<string, any>
  children?: BaseBlock[] | (() => BaseBlock[])
  sectionDepth?: number
  onPropsChange: (newProps: Record<string, any>) => void
  onRelocate?: ((id: string, newIndex: number, targetParentId?: string | null) => void) | undefined
  onOpenPicker?: () => void
  renderChildBlock?: (block: BaseBlock, depth: number) => any
}

export const TabsEditor: Component<TabsEditorProps> = (componentProps) => {
  let childrenContainer: HTMLDivElement | undefined = undefined
  let sortableInstance: any = null

  const childrenBlocks = (): BaseBlock[] => {
    if (typeof componentProps.children === "function") {
      return componentProps.children() || []
    }
    return componentProps.children || componentProps.props["children"] || []
  }

  onSettled(() => {
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

  return (
    <div class="rimelight-tabs-editor flex flex-col gap-3 p-3 rounded-xl border border-default/70 w-full">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-muted">Tabs Container</span>
        <RLButton
          variant="outline"
          color="neutral"
          size="xs"
          onClick={() => componentProps.onOpenPicker?.()}
          leadingIcon="plus"
          label="Add Tab Item"
        />
      </div>

      <div
        ref={(el) => (childrenContainer = el)}
        class="p-2 rounded-lg border border-dashed border-default flex flex-col gap-2 min-h-[36px]"
      >
        {childrenBlocks().length === 0 ? (
          <div class="text-center py-3">
            <span class="text-xs text-muted block mb-2">No tabs in container</span>
            <RLButton
              variant="link"
              color="primary"
              size="xs"
              onClick={() => componentProps.onOpenPicker?.()}
              label="+ Add Tab Item"
            />
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
