import { createSignal, onSettled, onCleanup, For, type Component } from "solid-js"
import type { BaseBlock } from "../../../core/types/blocks"
import { initBlockSortable, cleanAllSortableClasses } from "../../utils/sortable"
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx"
import { RLTextarea } from "@rimelight/ui/components/textarea/RLTextarea.tsx"
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx"
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx"

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
  const [charInputVal, setCharInputVal] = createSignal("")
  let childrenContainer: HTMLDivElement | null = null as HTMLDivElement | null
  let sortableInstance: any = null

  const characters = (): string[] => componentProps.props["characters"] || []
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

  const saveProps = (partial: Record<string, any>) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      ...partial,
      children: childrenBlocks()
    })
  }

  const addCharacter = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const currentChars = characters()
    if (!currentChars.includes(trimmed)) {
      const updated = [...currentChars, trimmed]
      setCharInputVal("")
      componentProps.onPropsChange({ ...componentProps.props, characters: updated })
    }
  }

  const removeCharacter = (name: string) => {
    const updated = characters().filter((c) => c !== name)
    componentProps.onPropsChange({ ...componentProps.props, characters: updated })
  }

  return (
    <div class="rimelight-script-editor flex flex-col gap-4 p-3 border-l-2 border-primary/50 w-full">
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-muted uppercase tracking-widest">Script Title</span>
        <RLInput
          data-field="title"
          value={componentProps.props["title"] || ""}
          onInput={(e) => saveProps({ title: e.currentTarget.value })}
          placeholder="Script Title"
          size="sm"
        />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-muted uppercase tracking-widest">Synopsis</span>
        <RLTextarea
          data-field="synopsis"
          value={componentProps.props["synopsis"] || ""}
          onInput={(e) => saveProps({ synopsis: e.currentTarget.value })}
          placeholder="Synopsis..."
          autoGrow
        />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-muted uppercase tracking-widest">Characters</span>
        <div class="chars-container flex flex-wrap gap-1.5 mb-1.5 min-h-[24px]">
          {characters().length === 0 ? (
            <div class="text-xs text-muted italic py-0.5">No characters added</div>
          ) : (
            <For each={characters()}>
              {(char) => (
                <RLBadge variant="soft" color="primary" size="sm">
                  <span>{char}</span>
                  <button
                    type="button"
                    onClick={() => removeCharacter(char)}
                    class="hover:text-red-500 cursor-pointer ml-1 font-bold bg-transparent border-none p-0 inline-flex items-center"
                  >
                    ×
                  </button>
                </RLBadge>
              )}
            </For>
          )}
        </div>
        <div class="flex gap-2">
          <div class="flex-1">
            <RLInput
              data-field="char-input"
              value={charInputVal()}
              onInput={(e) => setCharInputVal(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCharacter(charInputVal())
                }
              }}
              placeholder="New character name"
              size="sm"
            />
          </div>
          <RLButton
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => addCharacter(charInputVal())}
            label="Add"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-muted uppercase tracking-widest">Plots</span>
        <div class="grid grid-cols-3 gap-2">
          <RLInput
            data-field="aPlot"
            value={componentProps.props["aPlot"] || ""}
            onInput={(e) => saveProps({ aPlot: e.currentTarget.value })}
            placeholder="A-Plot"
            size="sm"
          />
          <RLInput
            data-field="bPlot"
            value={componentProps.props["bPlot"] || ""}
            onInput={(e) => saveProps({ bPlot: e.currentTarget.value })}
            placeholder="B-Plot"
            size="sm"
          />
          <RLInput
            data-field="cPlot"
            value={componentProps.props["cPlot"] || ""}
            onInput={(e) => saveProps({ cPlot: e.currentTarget.value })}
            placeholder="C-Plot"
            size="sm"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-muted uppercase tracking-widest">Stinger</span>
        <RLInput
          data-field="stinger"
          value={componentProps.props["stinger"] || ""}
          onInput={(e) => saveProps({ stinger: e.currentTarget.value })}
          placeholder="Stinger (post-credits etc)"
          size="sm"
        />
      </div>

      <div class="mt-2">
        <span class="text-xs font-bold text-muted uppercase tracking-widest block mb-1">
          Scenes & Content
        </span>
        <div
          ref={(el) => (childrenContainer = el)}
          class="children-container mt-1 pl-3 border-l-2 border-default flex flex-col gap-2 min-h-[60px]"
        >
          {childrenBlocks().length === 0 ? (
            <div class="cms-empty-placeholder relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-default text-center my-1">
              <div class="text-xs font-semibold text-muted">Empty script content</div>
              <RLButton
                variant="outline"
                color="neutral"
                size="xs"
                onClick={(e: MouseEvent) => {
                  e.stopPropagation()
                  componentProps.onOpenPicker?.()
                }}
                leadingIcon="plus"
                label="Add Block"
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
    </div>
  )
}
