import { onMount, onCleanup, For, type Component } from "solid-js"
import type { BaseBlock } from "../../../core/types/blocks"
import { initBlockSortable, cleanAllSortableClasses } from "../../utils/sortable"
import RLSSelect from "@rimelight/ui/components/select/RLSSelect.tsx"
import RLSButton from "@rimelight/ui/components/button/RLSButton.tsx"

export interface CardsEditorProps {
  blockId?: string
  props: Record<string, any>
  children?: BaseBlock[] | (() => BaseBlock[])
  sectionDepth?: number
  onPropsChange: (newProps: Record<string, any>) => void
  onRelocate?: ((id: string, newIndex: number, targetParentId?: string | null) => void) | undefined
  onOpenPicker?: () => void
  renderChildBlock?: (block: BaseBlock, depth: number) => any
}

const COLUMN_OPTIONS = [
  { label: "1 Column", value: "1" },
  { label: "2 Columns", value: "2" },
  { label: "3 Columns", value: "3" },
  { label: "4 Columns", value: "4" }
]

export const CardsEditor: Component<CardsEditorProps> = (componentProps) => {
  let childrenContainer: HTMLDivElement | undefined = undefined
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

  const setColumns = (colStr: string) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      columns: Number.parseInt(colStr, 10) || 2
    })
  }

  return (
    <div class="rimelight-cards-editor flex flex-col gap-3 p-3 rounded-xl border border-default/70 w-full">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Cards Grid
          </span>
          <div class="w-32">
            <RLSSelect
              items={COLUMN_OPTIONS}
              value={String(componentProps.props.columns || 2)}
              onChange={(e: Event & { currentTarget: HTMLSelectElement }) =>
                setColumns(e.currentTarget.value)
              }
              size="xs"
            />
          </div>
        </div>
        <RLSButton
          variant="outline"
          color="neutral"
          size="xs"
          onClick={() => componentProps.onOpenPicker?.()}
          leadingIcon="plus"
          label="Add Card"
        />
      </div>

      <div
        ref={(el) => (childrenContainer = el)}
        class="p-2 rounded-lg border border-dashed border-default flex flex-col gap-2 min-h-[36px]"
      >
        {childrenBlocks().length === 0 ? (
          <div class="text-center py-3">
            <span class="text-xs text-muted-foreground block mb-2">No cards in grid</span>
            <RLSButton
              variant="link"
              color="primary"
              size="xs"
              onClick={() => componentProps.onOpenPicker?.()}
              label="+ Add Card"
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
