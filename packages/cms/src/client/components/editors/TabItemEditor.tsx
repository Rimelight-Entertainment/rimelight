import { onMount, onCleanup, For, type Component } from "solid-js"
import type { BaseBlock } from "../../../core/types/blocks"
import { initBlockSortable, cleanAllSortableClasses } from "../../utils/sortable"
import RLSInput from "@rimelight/ui/components/input/RLSInput"
import RLSButton from "@rimelight/ui/components/button/RLSButton"

export interface TabItemEditorProps {
  blockId?: string
  props: Record<string, any>
  children?: BaseBlock[] | (() => BaseBlock[])
  sectionDepth?: number
  onPropsChange: (newProps: Record<string, any>) => void
  onRelocate?: ((id: string, newIndex: number, targetParentId?: string | null) => void) | undefined
  onOpenPicker?: () => void
  renderChildBlock?: (block: BaseBlock, depth: number) => any
}

export const TabItemEditor: Component<TabItemEditorProps> = (componentProps) => {
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

  const saveLabel = (label: string) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      label,
      value: componentProps.props.value || label.toLowerCase().replace(/\s+/g, "-")
    })
  }

  return (
    <div class="rimelight-tab-item-editor flex flex-col gap-2 p-3 rounded-lg border border-default bg-muted/10 w-full">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-muted-foreground uppercase">Tab Label:</span>
        <div class="flex-1 max-w-xs">
          <RLSInput
            type="text"
            placeholder="e.g. pnpm, Astro, TypeScript"
            value={componentProps.props.label || ""}
            onBlur={(e) => saveLabel(e.currentTarget.value)}
            size="sm"
          />
        </div>
      </div>

      <div
        ref={(el) => (childrenContainer = el)}
        class="p-2 rounded-lg border border-dashed border-default flex flex-col gap-2 min-h-[36px] bg-background"
      >
        {childrenBlocks().length === 0 ? (
          <div class="text-center py-2">
            <span class="text-xs text-muted-foreground block">Empty tab content</span>
            <RLSButton
              variant="link"
              color="primary"
              size="xs"
              onClick={() => componentProps.onOpenPicker?.()}
              label="+ Add block"
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
