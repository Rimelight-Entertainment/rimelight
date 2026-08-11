import { createSignal, onMount, onCleanup, For, type Component } from "solid-js"
import type { BaseBlock } from "../../../core/types/blocks"
import { initBlockSortable, cleanAllSortableClasses } from "../../utils/sortable"
import { createDefaultBlock } from "../../state/history"

export interface SceneEditorProps {
  blockId?: string
  props: Record<string, any>
  children?: BaseBlock[] | (() => BaseBlock[])
  sectionDepth?: number
  onPropsChange: (newProps: Record<string, any>) => void
  onRelocate?: ((id: string, newIndex: number, targetParentId?: string | null) => void) | undefined
  onOpenPicker?: () => void
  renderChildBlock?: (block: BaseBlock, depth: number) => any
}

const SETTINGS = ["INT.", "EXT.", "INT./EXT.", "OTHER"]
const TIMES_OF_DAY = [
  "MORNING",
  "DAY",
  "AFTERNOON",
  "EVENING",
  "NIGHT",
  "CONTINUOUS",
  "LATER",
  "OTHER"
]
const TRANSITIONS = ["NONE", "CUT_TO", "FADE_TO", "DISSOLVE_TO"]

export const SceneEditor: Component<SceneEditorProps> = (componentProps) => {
  let locationInput: HTMLInputElement | undefined
  let settingSelect: HTMLSelectElement | undefined
  let timeSelect: HTMLSelectElement | undefined
  let transitionSelect: HTMLSelectElement | undefined
  let descriptionTextarea: HTMLTextAreaElement | undefined
  let childrenCanvas: HTMLDivElement | undefined
  let sortableInstance: any = null

  const [addMenuOpen, setAddMenuOpen] = createSignal(false)
  const [slugText, setSlugText] = createSignal("")

  const childrenBlocks = (): BaseBlock[] => {
    if (typeof componentProps.children === "function") {
      return componentProps.children() || []
    }
    return componentProps.children || componentProps.props.children || []
  }

  const updateSlug = () => {
    const setting = settingSelect?.value || "INT."
    const loc = locationInput?.value.toUpperCase() || "LOCATION"
    const time = timeSelect?.value || "MORNING"
    setSlugText(`${setting} ${loc} - ${time}`)
  }

  const autoResize = () => {
    if (descriptionTextarea) {
      descriptionTextarea.style.height = "auto"
      descriptionTextarea.style.height = `${descriptionTextarea.scrollHeight + 2}px`
    }
  }

  const saveProps = () => {
    componentProps.onPropsChange({
      ...componentProps.props,
      location: locationInput?.value || "",
      timeOfDay: timeSelect?.value || "MORNING",
      setting: settingSelect?.value || "INT.",
      transition: transitionSelect?.value || "NONE",
      description: descriptionTextarea?.value || "",
      children: childrenBlocks()
    })
  }

  onMount(() => {
    if (descriptionTextarea) {
      descriptionTextarea.value = componentProps.props.description || ""
      autoResize()
    }
    updateSlug()

    if (childrenCanvas) {
      sortableInstance = initBlockSortable(childrenCanvas, {
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

  const addChildBlock = (type: string) => {
    const newBlock = createDefaultBlock(type)
    const list = [...childrenBlocks(), newBlock]
    componentProps.onPropsChange({ ...componentProps.props, children: list })
    setAddMenuOpen(false)
  }

  return (
    <div class="rimelight-scene-editor flex flex-col gap-3 p-3 border-l-4 border-cyan-500 bg-cyan-950/10 rounded-r-md w-full">
      <div class="slug-preview text-xs font-mono text-cyan-400 uppercase bg-gray-900 px-3 py-1.5 rounded mb-2">
        {slugText()}
      </div>

      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-1 col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Location
          <input
            id="scene-location-input"
            ref={(el) => (locationInput = el)}
            type="text"
            data-field="location"
            value={componentProps.props.location || ""}
            onInput={updateSlug}
            onBlur={saveProps}
            class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-cyan-500 uppercase font-normal"
            placeholder="E.g. LIVING ROOM"
          />
        </label>

        <label class="flex flex-col gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Setting
          <select
            id="scene-setting-select"
            ref={(el) => (settingSelect = el)}
            data-field="setting"
            value={componentProps.props.setting || "INT."}
            onChange={() => {
              updateSlug()
              saveProps()
            }}
            class="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded px-3 py-2 outline-none font-normal"
          >
            <For each={SETTINGS}>
              {(s) => (
                <option value={s} selected={s === (componentProps.props.setting || "INT.")}>
                  {s}
                </option>
              )}
            </For>
          </select>
        </label>

        <label class="flex flex-col gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Time of Day
          <select
            id="scene-time-select"
            ref={(el) => (timeSelect = el)}
            data-field="timeOfDay"
            value={componentProps.props.timeOfDay || "MORNING"}
            onChange={() => {
              updateSlug()
              saveProps()
            }}
            class="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded px-3 py-2 outline-none font-normal"
          >
            <For each={TIMES_OF_DAY}>
              {(t) => (
                <option value={t} selected={t === (componentProps.props.timeOfDay || "MORNING")}>
                  {t}
                </option>
              )}
            </For>
          </select>
        </label>
      </div>

      <label class="flex flex-col gap-1 mt-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Action / Description
        <textarea
          id="scene-description-textarea"
          ref={(el) => (descriptionTextarea = el)}
          data-field="description"
          onInput={autoResize}
          onBlur={saveProps}
          class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 resize-none outline-none focus:border-cyan-500 min-h-[80px] font-normal normal-case"
          placeholder="Action lines..."
        />
      </label>

      <label class="flex flex-col gap-1 mt-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Transition (End of Scene)
        <select
          id="scene-transition-select"
          ref={(el) => (transitionSelect = el)}
          data-field="transition"
          value={componentProps.props.transition || "NONE"}
          onChange={saveProps}
          class="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded px-3 py-2 outline-none font-normal"
        >
          <For each={TRANSITIONS}>
            {(tr) => (
              <option value={tr} selected={tr === (componentProps.props.transition || "NONE")}>
                {tr}
              </option>
            )}
          </For>
        </select>
      </label>

      <div
        ref={(el) => (childrenCanvas = el)}
        class="children-canvas mt-4 pl-4 border-l-2 border-cyan-800/50 flex flex-col gap-2 min-h-[100px]"
        data-container-type="scene"
      >
        {childrenBlocks().length === 0 ? (
          <div class="cms-empty-placeholder relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-cyan-900/60 bg-cyan-950/20 text-center my-1">
            <div class="text-xs font-semibold text-cyan-300">Empty scene</div>
            <p class="text-[11px] text-gray-500">Drag blocks here or click below to add content</p>
            <button
              type="button"
              onClick={() => setAddMenuOpen(true)}
              class="cms-add-child-block mt-1 px-3 py-1 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-xs font-medium rounded-md cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1"
            >
              + Add Content
            </button>
          </div>
        ) : (
          <For each={childrenBlocks()}>
            {(childBlock) =>
              componentProps.renderChildBlock?.(childBlock, (componentProps.sectionDepth || 0) + 1)
            }
          </For>
        )}
      </div>

      {addMenuOpen() && (
        <div class="add-block-menu mt-2 p-2 bg-gray-800 border border-gray-700 rounded flex gap-2">
          <button
            type="button"
            data-type="ParagraphBlock"
            onClick={() => addChildBlock("ParagraphBlock")}
            class="px-3 py-1.5 text-xs font-medium rounded bg-gray-700 hover:bg-gray-600 text-gray-200"
          >
            Text
          </button>
          <button
            type="button"
            data-type="DialogueBlock"
            onClick={() => addChildBlock("DialogueBlock")}
            class="px-3 py-1.5 text-xs font-medium rounded bg-purple-900/50 hover:bg-purple-800/50 text-purple-200"
          >
            Dialogue
          </button>
          <button
            type="button"
            onClick={() => setAddMenuOpen(false)}
            class="cancel-add-block-btn px-3 py-1.5 text-xs font-medium rounded text-gray-400 hover:text-gray-200 ml-auto"
          >
            Cancel
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAddMenuOpen(true)}
        class="add-scene-child-btn mt-4 px-3 py-1.5 text-xs font-medium rounded bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-300 border border-cyan-800/50 self-start"
      >
        + Add Content
      </button>
    </div>
  )
}
