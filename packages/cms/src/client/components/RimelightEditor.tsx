import { onMount, onCleanup, For, type Component } from "solid-js"
import type { EditorState } from "../state/editor-store"
import { RimelightBlock } from "./RimelightBlock"
import { RimelightBlockPicker } from "./RimelightBlockPicker"
import { initBlockSortable, cleanAllSortableClasses } from "../utils/sortable"

export interface RimelightEditorProps {
  state: EditorState
}

export const RimelightEditor: Component<RimelightEditorProps> = (props) => {
  let canvasContainer: HTMLDivElement | undefined = undefined
  let sortableInstance: any = null

  onMount(() => {
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
          // Intentionally empty: relocateBlock (called from onAdd on the target container)
          // handles the full atomic move (remove from source + insert at destination).
          // Doing anything here would double-mutate the state.
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
    window.addEventListener("keydown", handleKeydown)

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeydown)
      if (sortableInstance) sortableInstance.destroy()
    })
  })

  return (
    <div class="cms-editor-pane flex flex-col flex-1 w-full h-full bg-gray-900 border-right border-gray-800 overflow-hidden">
      <div id="cms-canvas-scroll" class="cms-block-canvas flex-1 overflow-y-auto w-full px-6 py-6">
        <div ref={canvasContainer} id="cms-canvas" class="w-full min-h-[50vh]">
          {props.state.blocks.length === 0 ? (
            <div class="cms-empty-state flex flex-col items-center justify-center py-12 w-full">
              <div class="relative flex flex-col items-center justify-center gap-3 rounded-xl p-6 sm:p-8 max-w-sm w-full text-center border border-dashed border-gray-800 bg-gray-900/40">
                <div class="text-3xl text-gray-500 mb-1">📄</div>
                <div class="flex flex-col items-center gap-1">
                  <h4 class="text-base font-semibold text-gray-100">No blocks yet</h4>
                  <p class="text-xs text-gray-400">
                    Start building your page by adding your first block
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => props.state.openPicker(null, "after", 0)}
                  class="cms-add-first-block mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1.5"
                >
                  + Add Block
                </button>
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
                  onOpenPicker={(targetId, pos, depth, parentId) =>
                    props.state.openPicker(targetId, pos, depth, parentId)
                  }
                />
              )}
            </For>
          )}
        </div>

        {props.state.blocks.length > 0 && (
          <div id="cms-footer" class="w-full mt-4">
            <div class="cms-add-block-footer flex items-center justify-center py-4">
              <button
                type="button"
                onClick={() => props.state.openPicker(null, "after", 0)}
                class="cms-add-block-btn flex items-center gap-2 px-4 py-2 border border-dashed border-gray-700 hover:border-blue-500 text-gray-500 hover:text-blue-400 text-xs rounded-lg cursor-pointer transition-colors"
              >
                + Add Block
              </button>
            </div>
          </div>
        )}
      </div>

      <RimelightBlockPicker
        open={props.state.pickerTarget().open}
        sectionDepth={props.state.pickerTarget().sectionDepth}
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
