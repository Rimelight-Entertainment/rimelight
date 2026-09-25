import { createSignal, onMount, onCleanup, For, Show, type Component } from "solid-js"
import type { BaseBlock } from "../../../core/types/blocks"
import { initBlockSortable, cleanAllSortableClasses } from "../../utils/sortable"
import { createDefaultBlock } from "../../state/history"
import RLSelect from "@rimelight/ui/components/select/RLSelect.tsx"
import RLInput from "@rimelight/ui/components/input/RLInput.tsx"
import RLTextarea from "@rimelight/ui/components/textarea/RLTextarea.tsx"
import RLButton from "@rimelight/ui/components/button/RLButton.tsx"

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
  let childrenCanvas: HTMLDivElement | undefined
  let sortableInstance: any = null

  const [addMenuOpen, setAddMenuOpen] = createSignal(false)

  const childrenBlocks = (): BaseBlock[] => {
    if (typeof componentProps.children === "function") {
      return componentProps.children() || []
    }
    return componentProps.children || componentProps.props["children"] || []
  }

  const slugText = () => {
    const setting = componentProps.props["setting"] || "INT."
    const loc = (componentProps.props["location"] || "LOCATION").toUpperCase()
    const time = componentProps.props["timeOfDay"] || "MORNING"
    return `${setting} ${loc} - ${time}`
  }

  const saveProps = (partial: Record<string, any>) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      ...partial,
      children: childrenBlocks()
    })
  }

  onMount(() => {
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
    <div class="rimelight-scene-editor flex flex-col gap-3 p-3 border-l-2 border-primary/50 w-full">
      <div class="slug-preview text-xs font-mono text-primary uppercase px-2 py-1 rounded border border-default/50 self-start">
        {slugText()}
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="col-span-2 flex flex-col gap-1">
          <span class="text-xs font-semibold text-muted uppercase tracking-wide">Location</span>
          <RLInput
            id="scene-location-input"
            data-field="location"
            value={componentProps.props["location"] || ""}
            onBlur={(e) => saveProps({ location: e.currentTarget.value })}
            placeholder="E.g. LIVING ROOM"
            size="sm"
          />
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-muted uppercase tracking-wide">Setting</span>
          <RLSelect
            items={SETTINGS}
            value={componentProps.props["setting"] || "INT."}
            onChange={(e: any) => saveProps({ setting: e.currentTarget.value })}
            size="sm"
          />
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-muted uppercase tracking-wide">Time of Day</span>
          <RLSelect
            items={TIMES_OF_DAY}
            value={componentProps.props["timeOfDay"] || "MORNING"}
            onChange={(e: any) => saveProps({ timeOfDay: e.currentTarget.value })}
            size="sm"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-semibold text-muted uppercase tracking-wide">
          Action / Description
        </span>
        <RLTextarea
          id="scene-description-textarea"
          data-field="description"
          value={componentProps.props["description"] || ""}
          onBlur={(e: any) => saveProps({ description: e.currentTarget.value })}
          placeholder="Action lines..."
          autoGrow
        />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-semibold text-muted uppercase tracking-wide">
          Transition (End of Scene)
        </span>
        <div class="w-48">
          <RLSelect
            items={TRANSITIONS}
            value={componentProps.props["transition"] || "NONE"}
            onChange={(e: any) => saveProps({ transition: e.currentTarget.value })}
            size="sm"
          />
        </div>
      </div>

      <div
        ref={(el) => (childrenCanvas = el)}
        class="children-canvas mt-2 pl-3 border-l-2 border-default flex flex-col gap-2 min-h-[60px]"
        data-container-type="scene"
      >
        {childrenBlocks().length === 0 ? (
          <div class="cms-empty-placeholder relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-default text-center my-1">
            <div class="text-xs font-semibold text-muted">Empty scene</div>
            <RLButton
              variant="outline"
              color="neutral"
              size="xs"
              onClick={() => setAddMenuOpen(true)}
              leadingIcon="plus"
              label="Add Content"
            />
          </div>
        ) : (
          <For each={childrenBlocks()}>
            {(childBlock) =>
              componentProps.renderChildBlock?.(childBlock, (componentProps.sectionDepth || 0) + 1)
            }
          </For>
        )}
      </div>

      <Show when={addMenuOpen()}>
        <div class="add-block-menu mt-2 p-2 rounded-lg border border-default flex items-center gap-2">
          <RLButton
            variant="soft"
            color="neutral"
            size="xs"
            onClick={() => addChildBlock("ParagraphBlock")}
            label="Text"
          />
          <RLButton
            variant="soft"
            color="primary"
            size="xs"
            onClick={() => addChildBlock("DialogueBlock")}
            label="Dialogue"
          />
          <div class="ml-auto">
            <RLButton
              variant="ghost"
              color="neutral"
              size="xs"
              onClick={() => setAddMenuOpen(false)}
              label="Cancel"
            />
          </div>
        </div>
      </Show>

      <div class="pt-1">
        <RLButton
          variant="outline"
          color="neutral"
          size="xs"
          onClick={() => setAddMenuOpen(true)}
          leadingIcon="plus"
          label="Add Content"
        />
      </div>
    </div>
  )
}
