import { onSettled, onCleanup, For, type Component } from "solid-js"
import type { EditorState } from "../state/editor-store"
import { RimelightBlock } from "./RimelightBlock"
import { RimelightBlockPicker } from "./RimelightBlockPicker"
import { initBlockSortable, cleanAllSortableClasses } from "../utils/sortable"
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx"

export interface RimelightEditorProps {
  state: EditorState
}

export const RimelightEditor: Component<RimelightEditorProps> = (props) => {
  let canvasContainer: HTMLDivElement | undefined = undefined
  let sortableInstance: any = null

  onSettled(() => {
    if (canvasContainer) {
      sortableInstance = initBlockSortable(canvasContainer, {
        handle: ".cms-grip-btn",
        filter: ".cms-empty-state, .locked",
        onReorder: (oldIdx: number, newIdx: number) => {
          cleanAllSortableClasses()
          const list = [...props.state.blocks]
          const item = list.splice(oldIdx, 1)[0]
          if (item) {
            list.splice(newIdx, 0, item)
            props.state.setBlocks(list)
          }
          requestAnimationFrame(() => cleanAllSortableClasses())
          setTimeout(cleanAllSortableClasses, 50)
          setTimeout(cleanAllSortableClasses, 200)
        },
        onAdd: (blockId: string, newIdx: number) => {
          cleanAllSortableClasses()
          props.state.relocateBlock(blockId, newIdx, null)
          requestAnimationFrame(() => cleanAllSortableClasses())
          setTimeout(cleanAllSortableClasses, 50)
          setTimeout(cleanAllSortableClasses, 200)
        },
        onRemove: (_blockId: string, _oldIdx: number) => {
          cleanAllSortableClasses()
        }
      })
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        props.state.undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        props.state.redo()
      }
    }
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeydown)
    }

    onCleanup(() => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeydown)
      }
      if (sortableInstance) sortableInstance.destroy()
    })
  })

  return (
    <div class="flex flex-col gap-6 w-full bg-transparent">
      <div ref={canvasContainer} class="flex flex-col gap-3 w-full min-h-[200px] pl-6">
        {props.state.blocks.length === 0 ? (
          <div class="flex flex-col items-center justify-center p-8 sm:p-12 rounded-xl border border-dashed border-default text-center my-4">
            <div class="text-3xl text-muted mb-2">📄</div>
            <h4 class="text-base font-semibold text-highlighted">No blocks yet</h4>
            <p class="text-xs text-muted mt-1 max-w-xs">
              Start building your page content by adding your first block below.
            </p>
            <div class="mt-4">
              <RLButton
                variant="outline"
                color="neutral"
                size="sm"
                onClick={() => props.state.openPicker(null, "after", 0)}
                leadingIcon="plus"
                label="Add Block"
              />
            </div>
          </div>
        ) : (
          <For each={props.state.blocks}>
            {(block) => (
              <RimelightBlock
                block={block}
                sectionDepth={0}
                onPropsChange={props.state.updateBlockProps}
                onMove={props.state.moveBlock}
                onDelete={props.state.deleteBlock}
                onDuplicate={props.state.duplicateBlock}
                onAddAdjacent={(targetId, pos) => props.state.openPicker(targetId, pos, 0)}
                onRelocate={props.state.relocateBlock}
                onOpenPicker={(targetId, pos, depth, parentId, containerType) =>
                  props.state.openPicker(targetId, pos, depth, parentId, containerType)
                }
              />
            )}
          </For>
        )}
      </div>

      {props.state.blocks.length > 0 && (
        <div class="flex flex-col items-center justify-center gap-4 p-4 mt-2">
          <RLButton
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => props.state.openPicker(null, "after", 0, null, "Root")}
            leadingIcon="plus"
            label="Add Block"
          />
        </div>
      )}

      <RimelightBlockPicker
        open={props.state.pickerTarget().open}
        sectionDepth={props.state.pickerTarget().sectionDepth}
        containerType={props.state.pickerTarget().containerType}
        onSelect={(type) => {
          const { targetId, position, parentId } = props.state.pickerTarget()
          props.state.insertBlock(type, targetId, position, parentId)
          props.state.closePicker()
        }}
        onClose={props.state.closePicker}
      />
    </div>
  )
}
