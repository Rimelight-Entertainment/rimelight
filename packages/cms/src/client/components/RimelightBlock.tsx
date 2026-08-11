import { createSignal, onMount, onCleanup, type Component } from "solid-js"
import type { BaseBlock } from "../../core/types/blocks"
import { ParagraphEditor } from "./editors/ParagraphEditor"
import { SectionEditor } from "./editors/SectionEditor"
import { CalloutEditor } from "./editors/CalloutEditor"
import { ImageEditor } from "./editors/ImageEditor"
import { CodeEditor } from "./editors/CodeEditor"
import { ScriptEditor } from "./editors/ScriptEditor"
import { SceneEditor } from "./editors/SceneEditor"
import { DialogueEditor } from "./editors/DialogueEditor"

export interface RimelightBlockProps {
  block: BaseBlock
  sectionDepth?: number | undefined
  onPropsChange: (id: string, props: Record<string, any>) => void
  onMove: (id: string, direction: -1 | 1) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onAddAdjacent: (targetId: string, position: "before" | "after") => void
  onRelocate?: ((id: string, newIndex: number, targetParentId?: string | null) => void) | undefined
  onOpenPicker?:
    | ((
        targetId: string | null,
        position: "before" | "after",
        sectionDepth: number,
        parentId?: string | null
      ) => void)
    | undefined
}

export const RimelightBlock: Component<RimelightBlockProps> = (props) => {
  const [contextMenuOpen, setContextMenuOpen] = createSignal(false)
  let blockWrapEl: HTMLDivElement | undefined

  const isLocked = () => !!props.block.isTemplated || props.block.templatedProps === true

  onMount(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target instanceof Node ? e.target : null
      if (contextMenuOpen() && blockWrapEl && target && !blockWrapEl.contains(target)) {
        setContextMenuOpen(false)
      }
    }
    document.addEventListener("click", handleOutsideClick)
    onCleanup(() => document.removeEventListener("click", handleOutsideClick))
  })

  const renderEditorComponent = (blockItem: BaseBlock, depth: number) => {
    const handleProps = (newProps: Record<string, any>) => {
      props.onPropsChange(blockItem.id, newProps)
    }

    const renderChildBlock = (childBlock: BaseBlock, childDepth: number) => (
      <RimelightBlock
        block={childBlock}
        sectionDepth={childDepth}
        onPropsChange={props.onPropsChange}
        onMove={props.onMove}
        onDelete={props.onDelete}
        onDuplicate={props.onDuplicate}
        onAddAdjacent={props.onAddAdjacent}
        onRelocate={props.onRelocate}
        onOpenPicker={props.onOpenPicker}
      />
    )

    const childrenList = () => {
      if (Array.isArray(props.block.children)) return props.block.children
      if (Array.isArray(props.block.props?.children)) return props.block.props.children
      return []
    }

    switch (blockItem.type) {
      case "ParagraphBlock":
        return <ParagraphEditor props={blockItem.props} onPropsChange={handleProps} />
      case "SectionBlock":
        return (
          <SectionEditor
            blockId={props.block.id}
            props={props.block.props}
            children={childrenList}
            sectionDepth={depth}
            onPropsChange={handleProps}
            onRelocate={props.onRelocate}
            onOpenPicker={() => props.onOpenPicker?.(null, "after", depth + 1, props.block.id)}
            renderChildBlock={renderChildBlock}
          />
        )
      case "CalloutBlock":
        return (
          <CalloutEditor
            blockId={props.block.id}
            props={props.block.props}
            children={childrenList}
            sectionDepth={depth}
            onPropsChange={handleProps}
            onRelocate={props.onRelocate}
            onOpenPicker={() => props.onOpenPicker?.(null, "after", depth, props.block.id)}
            renderChildBlock={renderChildBlock}
          />
        )
      case "ImageBlock":
        return <ImageEditor props={blockItem.props} onPropsChange={handleProps} />
      case "CodeBlock":
        return <CodeEditor props={blockItem.props} onPropsChange={handleProps} />
      case "ScriptBlock":
        return (
          <ScriptEditor
            blockId={props.block.id}
            props={props.block.props}
            children={childrenList}
            sectionDepth={depth}
            onPropsChange={handleProps}
            onRelocate={props.onRelocate}
            onOpenPicker={() => props.onOpenPicker?.(null, "after", depth, props.block.id)}
            renderChildBlock={renderChildBlock}
          />
        )
      case "SceneBlock":
        return (
          <SceneEditor
            blockId={props.block.id}
            props={props.block.props}
            children={childrenList}
            sectionDepth={depth}
            onPropsChange={handleProps}
            onRelocate={props.onRelocate}
            onOpenPicker={() => props.onOpenPicker?.(null, "after", depth, props.block.id)}
            renderChildBlock={renderChildBlock}
          />
        )
      case "DialogueBlock":
        return <DialogueEditor props={blockItem.props} onPropsChange={handleProps} />
      default:
        return <ParagraphEditor props={blockItem.props} onPropsChange={handleProps} />
    }
  }

  return (
    <div
      ref={(el) => (blockWrapEl = el)}
      data-id={props.block.id}
      data-block-id={props.block.id}
      data-block-type={props.block.type}
      class="cms-block-wrap group/block relative w-full block my-2"
    >
      <div class="cms-block-grip absolute left-2 top-3 z-20 flex items-center gap-1 opacity-70 hover:opacity-100 group-hover/block:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setContextMenuOpen(!contextMenuOpen())
          }}
          class="cms-grip-btn cms-drag-handle p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 cursor-grab active:cursor-grabbing flex items-center justify-center text-sm select-none"
          title="Drag to reorder / Click for options"
        >
          ⠿
        </button>

        {contextMenuOpen() && (
          <div class="absolute left-0 top-8 z-50 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-1">
            {isLocked() ? (
              <div class="px-3 py-2 text-xs text-gray-400 italic">
                Locked — cannot delete or move
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    props.onMove(props.block.id, -1)
                    setContextMenuOpen(false)
                  }}
                  class="menu-item-move-up flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-800 cursor-pointer text-gray-300 transition-colors bg-transparent border-none text-left"
                >
                  Move Up ↑
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onMove(props.block.id, 1)
                    setContextMenuOpen(false)
                  }}
                  class="menu-item-move-down flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-800 cursor-pointer text-gray-300 transition-colors bg-transparent border-none text-left"
                >
                  Move Down ↓
                </button>
                <div class="my-1 border-t border-gray-800"></div>
                <button
                  type="button"
                  onClick={() => {
                    props.onAddAdjacent(props.block.id, "before")
                    setContextMenuOpen(false)
                  }}
                  class="menu-item-add-above flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-800 cursor-pointer text-gray-300 transition-colors bg-transparent border-none text-left"
                >
                  Add Block Above
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onAddAdjacent(props.block.id, "after")
                    setContextMenuOpen(false)
                  }}
                  class="menu-item-add-below flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-800 cursor-pointer text-gray-300 transition-colors bg-transparent border-none text-left"
                >
                  Add Block Below
                </button>
                <div class="my-1 border-t border-gray-800"></div>
                <button
                  type="button"
                  onClick={() => {
                    props.onDuplicate(props.block.id)
                    setContextMenuOpen(false)
                  }}
                  class="menu-item-duplicate flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-800 cursor-pointer text-gray-300 transition-colors bg-transparent border-none text-left"
                >
                  Duplicate Block
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onDelete(props.block.id)
                    setContextMenuOpen(false)
                  }}
                  class="menu-item-delete flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-800 cursor-pointer text-red-400 hover:text-red-300 transition-colors bg-transparent border-none text-left"
                >
                  Delete Block
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div class="cms-block-node flex-1 min-w-0 pl-10 pr-4 py-2 bg-gray-900/60 border border-gray-800 rounded-lg relative">
        {isLocked() && (
          <div class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs mb-2 select-none">
            🔒 Locked
          </div>
        )}
        <div class="cms-editor-container">
          {renderEditorComponent(props.block, props.sectionDepth || 0)}
        </div>
      </div>
    </div>
  )
}
