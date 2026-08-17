import { onMount, onCleanup, For, type Component } from "solid-js"
import { type BaseBlock, calculateHeadingLevel } from "../../../core/types/blocks"
import { initBlockSortable, cleanAllSortableClasses } from "../../utils/sortable"
import RLSButton from "@rimelight/ui/components/button/RLSButton"

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

  const headingLevel = () => calculateHeadingLevel(componentProps.sectionDepth || 0)

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
      level: headingLevel(),
      children: childrenBlocks()
    })
  }

  return (
    <div class="w-full flex flex-col gap-2 py-0.5">
      <div class="flex items-center gap-2.5">
        <span class="text-xs font-bold text-muted-foreground select-none shrink-0 tracking-wider">
          H{headingLevel()}
        </span>
        <input
          ref={(el) => (titleInput = el)}
          type="text"
          value={componentProps.props.title || ""}
          onInput={saveProps}
          placeholder="Section Title"
          class="flex-1 font-bold text-lg bg-transparent border-0 focus:outline-none text-foreground placeholder:text-muted-foreground/60 py-0.5"
        />
      </div>

      <input
        ref={(el) => (descInput = el)}
        type="text"
        value={componentProps.props.description || ""}
        onInput={saveProps}
        placeholder="Section description (optional)..."
        class="text-sm text-muted-foreground bg-transparent border-0 focus:outline-none placeholder:text-muted-foreground/50 py-0.5"
      />

      <div
        ref={(el) => (childrenContainer = el)}
        class="ml-1 pl-8 border-l-2 border-primary/30 flex flex-col gap-2 mt-1 min-h-[32px]"
      >
        {childrenBlocks().length === 0 ? (
          <div class="flex flex-col items-center justify-center p-3 border border-dashed border-default rounded-lg text-center">
            <span class="text-xs text-muted-foreground">Empty section</span>
            <RLSButton
              variant="link"
              color="primary"
              size="xs"
              onClick={() => componentProps.onOpenPicker?.()}
              label="+ Add first block"
            />
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
        <RLSButton
          variant="ghost"
          color="neutral"
          size="xs"
          onClick={() => componentProps.onOpenPicker?.()}
          leadingIcon="plus"
          label="Add block"
        />
      </div>
    </div>
  )
}
