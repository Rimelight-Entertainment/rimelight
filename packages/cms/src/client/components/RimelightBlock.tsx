import { createSignal, onMount, onCleanup, Show, type Component } from "solid-js"
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
        parentId?: string | null,
        containerType?: string | null
      ) => void)
    | undefined
}

export const RimelightBlock: Component<RimelightBlockProps> = (props) => {
  const [menuOpen, setMenuOpen] = createSignal(false)
  let menuWrapEl: HTMLDivElement | undefined

  const isLocked = () => !!props.block.isTemplated || props.block.templatedProps === true

  onMount(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target instanceof Node ? e.target : null
      if (menuOpen() && menuWrapEl && target && !menuWrapEl.contains(target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("click", handleOutside)
    onCleanup(() => document.removeEventListener("click", handleOutside))
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
      if (Array.isArray(blockItem.children)) return blockItem.children
      if (Array.isArray(blockItem.props?.children)) return blockItem.props.children
      return []
    }

    switch (blockItem.type) {
      case "ParagraphBlock":
        return <ParagraphEditor props={blockItem.props} onPropsChange={handleProps} />
      case "SectionBlock":
        return (
          <SectionEditor
            blockId={blockItem.id}
            props={blockItem.props}
            children={childrenList}
            sectionDepth={depth}
            onPropsChange={handleProps}
            onRelocate={props.onRelocate}
            onOpenPicker={() =>
              props.onOpenPicker?.(null, "after", depth + 1, blockItem.id, "SectionBlock")
            }
            renderChildBlock={renderChildBlock}
          />
        )
      case "CalloutBlock":
        return (
          <CalloutEditor
            blockId={blockItem.id}
            props={blockItem.props}
            children={childrenList}
            sectionDepth={depth}
            onPropsChange={handleProps}
            onRelocate={props.onRelocate}
            onOpenPicker={() =>
              props.onOpenPicker?.(null, "after", depth, blockItem.id, "CalloutBlock")
            }
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
            blockId={blockItem.id}
            props={blockItem.props}
            children={childrenList}
            sectionDepth={depth}
            onPropsChange={handleProps}
            onRelocate={props.onRelocate}
            onOpenPicker={() =>
              props.onOpenPicker?.(null, "after", depth, blockItem.id, "ScriptBlock")
            }
            renderChildBlock={renderChildBlock}
          />
        )
      case "SceneBlock":
        return (
          <SceneEditor
            blockId={blockItem.id}
            props={blockItem.props}
            children={childrenList}
            sectionDepth={depth}
            onPropsChange={handleProps}
            onRelocate={props.onRelocate}
            onOpenPicker={() =>
              props.onOpenPicker?.(null, "after", depth, blockItem.id, "SceneBlock")
            }
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
      data-id={props.block.id}
      data-block-id={props.block.id}
      data-block-type={props.block.type}
      class="cms-block-wrap group/block relative w-full my-2 flex items-start gap-2"
    >
      {/* Left Drag Grip Handle with Dropdown Menu */}
      <div
        ref={(el) => (menuWrapEl = el)}
        class="cms-block-grip pt-3 shrink-0 relative flex items-center justify-center opacity-40 hover:opacity-100 group-hover/block:opacity-100 transition-opacity"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen(!menuOpen())
          }}
          aria-label="Drag handle and options menu"
          class="cms-grip-btn cms-drag-handle p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing flex items-center justify-center transition border-0 bg-transparent"
          title="Drag to reorder / Click for options"
        >
          <svg
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="9" cy="12" r="1" fill="currentColor" />
            <circle cx="9" cy="5" r="1" fill="currentColor" />
            <circle cx="9" cy="19" r="1" fill="currentColor" />
            <circle cx="15" cy="12" r="1" fill="currentColor" />
            <circle cx="15" cy="5" r="1" fill="currentColor" />
            <circle cx="15" cy="19" r="1" fill="currentColor" />
          </svg>
        </button>

        {/* Dropdown Options Menu */}
        <Show when={menuOpen()}>
          <div class="absolute left-0 top-10 z-50 w-48 bg-white dark:bg-neutral-900 border border-default rounded-xl shadow-xl py-1 text-xs">
            {isLocked() ? (
              <div class="px-3 py-2 text-muted-foreground italic">
                Locked — templated block
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    props.onMove(props.block.id, -1)
                    setMenuOpen(false)
                  }}
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-foreground transition-colors bg-transparent border-0 text-left"
                >
                  <span>Move Up</span>
                  <span class="ml-auto text-muted-foreground">↑</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onMove(props.block.id, 1)
                    setMenuOpen(false)
                  }}
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-foreground transition-colors bg-transparent border-0 text-left"
                >
                  <span>Move Down</span>
                  <span class="ml-auto text-muted-foreground">↓</span>
                </button>
                <div class="my-1 border-t border-default" />
                <button
                  type="button"
                  onClick={() => {
                    props.onAddAdjacent(props.block.id, "before")
                    setMenuOpen(false)
                  }}
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-foreground transition-colors bg-transparent border-0 text-left"
                >
                  <span>Add Block Above</span>
                  <span class="ml-auto text-muted-foreground">+</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onAddAdjacent(props.block.id, "after")
                    setMenuOpen(false)
                  }}
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-foreground transition-colors bg-transparent border-0 text-left"
                >
                  <span>Add Block Below</span>
                  <span class="ml-auto text-muted-foreground">+</span>
                </button>
                <div class="my-1 border-t border-default" />
                <button
                  type="button"
                  onClick={() => {
                    props.onDuplicate(props.block.id)
                    setMenuOpen(false)
                  }}
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-foreground transition-colors bg-transparent border-0 text-left"
                >
                  <span>Duplicate Block</span>
                  <span class="ml-auto text-muted-foreground">❐</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onDelete(props.block.id)
                    setMenuOpen(false)
                  }}
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 hover:text-red-600 cursor-pointer transition-colors bg-transparent border-0 text-left"
                >
                  <span>Delete Block</span>
                  <span class="ml-auto">🗑</span>
                </button>
              </>
            )}
          </div>
        </Show>
      </div>

      <div class="flex-1 min-w-0 relative">
        {/* Top Action Floating Toolbar */}
        <div class="absolute -top-3 right-4 z-20 opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center gap-0.5 bg-white dark:bg-neutral-800 border border-default rounded-lg p-0.5 shadow-md">
          <button
            type="button"
            onClick={() => props.onAddAdjacent(props.block.id, "before")}
            aria-label="Add block above"
            class="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition cursor-pointer border-0 bg-transparent"
            title="Add block above"
          >
            <svg
              class="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => props.onAddAdjacent(props.block.id, "after")}
            aria-label="Add block below"
            class="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition cursor-pointer border-0 bg-transparent"
            title="Add block below"
          >
            <svg
              class="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => props.onMove(props.block.id, -1)}
            aria-label="Move up"
            class="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition cursor-pointer border-0 bg-transparent"
            title="Move up"
          >
            <svg
              class="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => props.onMove(props.block.id, 1)}
            aria-label="Move down"
            class="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition cursor-pointer border-0 bg-transparent"
            title="Move down"
          >
            <svg
              class="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => props.onDuplicate(props.block.id)}
            aria-label="Duplicate"
            class="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition cursor-pointer border-0 bg-transparent"
            title="Duplicate"
          >
            <svg
              class="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => props.onDelete(props.block.id)}
            aria-label="Delete"
            class="p-1 rounded text-red-500 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition cursor-pointer border-0 bg-transparent"
            title="Delete"
          >
            <svg
              class="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>

        {/* Block Editor Body */}
        <div class="w-full transition-all rounded-xl hover:ring-1 hover:ring-primary/40">
          {isLocked() && (
            <div class="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded text-xs mb-2 select-none border border-default">
              🔒 Templated Block (Locked)
            </div>
          )}
          <div class="w-full">{renderEditorComponent(props.block, props.sectionDepth || 0)}</div>
        </div>
      </div>
    </div>
  )
}
