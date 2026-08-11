import { onMount, onCleanup, For, type Component } from "solid-js"
import type { BaseBlock } from "../../../core/types/blocks"
import { initBlockSortable, cleanAllSortableClasses } from "../../utils/sortable"

export interface ScriptEditorProps {
  blockId?: string
  props: Record<string, any>
  children?: BaseBlock[] | (() => BaseBlock[])
  sectionDepth?: number
  onPropsChange: (newProps: Record<string, any>) => void
  onRelocate?: ((id: string, newIndex: number, targetParentId?: string | null) => void) | undefined
  onOpenPicker?: () => void
  renderChildBlock?: (block: BaseBlock, depth: number) => any
}

export const ScriptEditor: Component<ScriptEditorProps> = (componentProps) => {
  let titleInput: HTMLInputElement | null = null as HTMLInputElement | null
  let synopsisTextarea: HTMLTextAreaElement | null = null as HTMLTextAreaElement | null
  let charInput: HTMLInputElement | null = null as HTMLInputElement | null
  let aPlotInput: HTMLInputElement | null = null as HTMLInputElement | null
  let bPlotInput: HTMLInputElement | null = null as HTMLInputElement | null
  let cPlotInput: HTMLInputElement | null = null as HTMLInputElement | null
  let stingerInput: HTMLInputElement | null = null as HTMLInputElement | null
  let childrenContainer: HTMLDivElement | null = null as HTMLDivElement | null
  let sortableInstance: any = null

  const characters = (): string[] => componentProps.props.characters || []
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
          // Intentionally empty: the target container's onAdd -> relocateBlock handles this.
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
      synopsis: synopsisTextarea?.value || "",
      aPlot: aPlotInput?.value || "",
      bPlot: bPlotInput?.value || "",
      cPlot: cPlotInput?.value || "",
      stinger: stingerInput?.value || "",
      children: childrenBlocks()
    })
  }

  const addCharacter = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const currentChars = characters()
    if (!currentChars.includes(trimmed)) {
      const updated = [...currentChars, trimmed]
      if (charInput) charInput.value = ""
      componentProps.onPropsChange({ ...componentProps.props, characters: updated })
    }
  }

  const removeCharacter = (name: string) => {
    const updated = characters().filter((c) => c !== name)
    componentProps.onPropsChange({ ...componentProps.props, characters: updated })
  }

  return (
    <div class="rimelight-script-editor flex flex-col gap-4 p-3 border-l-4 border-amber-500 bg-amber-950/10 rounded-r-md w-full">
      <div>
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
          Script Title
        </div>
        <input
          ref={(el) => (titleInput = el)}
          type="text"
          data-field="title"
          value={componentProps.props.title || ""}
          onInput={saveProps}
          placeholder="Script Title"
          class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Synopsis</div>
        <textarea
          ref={(el) => (synopsisTextarea = el)}
          data-field="synopsis"
          value={componentProps.props.synopsis || ""}
          onInput={saveProps}
          placeholder="Synopsis..."
          class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500 resize-y min-h-[60px]"
        />
      </div>

      <div>
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
          Characters
        </div>
        <div class="chars-container flex flex-wrap gap-2 mb-2 min-h-[24px]">
          {characters().length === 0 ? (
            <div class="text-xs text-gray-500 italic py-1">No characters added</div>
          ) : (
            <For each={characters()}>
              {(char) => (
                <div class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-900/40 text-amber-200 text-xs rounded-full">
                  <span>{char}</span>
                  <button
                    type="button"
                    onClick={() => removeCharacter(char)}
                    class="text-amber-400 hover:text-red-400 cursor-pointer ml-1 font-bold bg-transparent border-none p-0"
                  >
                    ×
                  </button>
                </div>
              )}
            </For>
          )}
        </div>
        <div class="flex gap-2">
          <input
            ref={(el) => (charInput = el)}
            type="text"
            data-field="char-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addCharacter(charInput?.value || "")
              }
            }}
            placeholder="New character name"
            class="char-input bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 flex-1"
          />
          <button
            type="button"
            onClick={() => addCharacter(charInput?.value || "")}
            class="add-char-btn px-3 py-1.5 text-xs font-medium rounded cursor-pointer bg-gray-700 text-gray-200 hover:bg-gray-600"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Plots</div>
        <div class="grid grid-cols-3 gap-3">
          <input
            ref={(el) => (aPlotInput = el)}
            type="text"
            data-field="aPlot"
            value={componentProps.props.aPlot || ""}
            onInput={saveProps}
            placeholder="A-Plot"
            class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500"
          />
          <input
            ref={(el) => (bPlotInput = el)}
            type="text"
            data-field="bPlot"
            value={componentProps.props.bPlot || ""}
            onInput={saveProps}
            placeholder="B-Plot"
            class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500"
          />
          <input
            ref={(el) => (cPlotInput = el)}
            type="text"
            data-field="cPlot"
            value={componentProps.props.cPlot || ""}
            onInput={saveProps}
            placeholder="C-Plot"
            class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Stinger</div>
        <input
          ref={(el) => (stingerInput = el)}
          type="text"
          data-field="stinger"
          value={componentProps.props.stinger || ""}
          onInput={saveProps}
          placeholder="Stinger (post-credits etc)"
          class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500"
        />
      </div>

      <div class="mt-4">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
          Scenes & Content
        </div>
        <div
          ref={(el) => (childrenContainer = el)}
          class="children-container mt-2 pl-4 border-l-2 border-amber-800/50 flex flex-col gap-2 min-h-[60px]"
        >
          {childrenBlocks().length === 0 ? (
            <div class="cms-empty-placeholder relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-gray-800/80 bg-gray-900/20 text-center my-1">
              <div class="text-xs font-semibold text-gray-300">Empty script content</div>
              <p class="text-[11px] text-gray-500">
                Drag scenes here or click below to add content
              </p>
              <button
                type="button"
                onClick={(e) => {
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
