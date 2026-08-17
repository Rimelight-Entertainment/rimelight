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
import RLSButton from "@rimelight/ui/components/button/RLSButton"
import RLSIcon from "@rimelight/ui/components/icon/RLSIcon"

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
      class="cms-block-wrap group/block relative w-full my-1 flex items-start"
    >
      {/* Top-Left Drag Grip Handle (Aligned to top-left, shows only on hover) */}
      <div
        ref={(el) => (menuWrapEl = el)}
        class="cms-block-grip absolute -left-7 top-1 z-30 flex items-center justify-center opacity-0 group-hover/block:opacity-100 transition-opacity"
      >
        <RLSButton
          variant="ghost"
          color="neutral"
          size="xs"
          square={true}
          onClick={(e: MouseEvent) => {
            e.stopPropagation()
            setMenuOpen(!menuOpen())
          }}
          aria-label="Drag handle and options menu"
          class="cms-grip-btn cms-drag-handle !p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing rounded-md"
          title="Drag to reorder / Click for options"
          leading={<RLSIcon name="gripVertical" size="sm" />}
        />

        {/* Dropdown Options Menu */}
        <Show when={menuOpen()}>
          <div class="absolute left-0 top-7 z-50 w-48 bg-elevated border border-default rounded-xl shadow-xl py-1 text-xs">
            {isLocked() ? (
              <div class="px-3 py-2 text-muted-foreground italic">Locked — templated block</div>
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
                  <RLSIcon name="arrowUp" size="xs" class="text-muted-foreground" />
                  <span>Move Up</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onMove(props.block.id, 1)
                    setMenuOpen(false)
                  }}
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-foreground transition-colors bg-transparent border-0 text-left"
                >
                  <RLSIcon name="arrowDown" size="xs" class="text-muted-foreground" />
                  <span>Move Down</span>
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
                  <RLSIcon name="plus" size="xs" class="text-muted-foreground" />
                  <span>Add Block Above</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onAddAdjacent(props.block.id, "after")
                    setMenuOpen(false)
                  }}
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-foreground transition-colors bg-transparent border-0 text-left"
                >
                  <RLSIcon name="plus" size="xs" class="text-muted-foreground" />
                  <span>Add Block Below</span>
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
                  <RLSIcon name="copy" size="xs" class="text-muted-foreground" />
                  <span>Duplicate Block</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    props.onDelete(props.block.id)
                    setMenuOpen(false)
                  }}
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 hover:text-red-600 cursor-pointer transition-colors bg-transparent border-0 text-left"
                >
                  <RLSIcon name="trash" size="xs" class="text-red-500" />
                  <span>Delete Block</span>
                </button>
              </>
            )}
          </div>
        </Show>
      </div>

      <div class="flex-1 min-w-0 relative">
        {/* Top Action Floating Toolbar (Shows on hover, inside block at top-right) */}
        <div class="absolute top-0 right-0 z-20 opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center gap-0.5 bg-elevated border border-default rounded-lg p-0.5 shadow-md">
          <RLSButton
            variant="ghost"
            color="neutral"
            size="xs"
            square={true}
            onClick={() => props.onAddAdjacent(props.block.id, "before")}
            aria-label="Add block above"
            title="Add block above"
            leading={<RLSIcon name="plus" size="xs" />}
          />
          <RLSButton
            variant="ghost"
            color="neutral"
            size="xs"
            square={true}
            onClick={() => props.onAddAdjacent(props.block.id, "after")}
            aria-label="Add block below"
            title="Add block below"
            leading={<RLSIcon name="plus" size="xs" />}
          />
          <RLSButton
            variant="ghost"
            color="neutral"
            size="xs"
            square={true}
            onClick={() => props.onMove(props.block.id, -1)}
            aria-label="Move up"
            title="Move up"
            leading={<RLSIcon name="arrowUp" size="xs" />}
          />
          <RLSButton
            variant="ghost"
            color="neutral"
            size="xs"
            square={true}
            onClick={() => props.onMove(props.block.id, 1)}
            aria-label="Move down"
            title="Move down"
            leading={<RLSIcon name="arrowDown" size="xs" />}
          />
          <RLSButton
            variant="ghost"
            color="neutral"
            size="xs"
            square={true}
            onClick={() => props.onDuplicate(props.block.id)}
            aria-label="Duplicate"
            title="Duplicate"
            leading={<RLSIcon name="copy" size="xs" />}
          />
          <RLSButton
            variant="ghost"
            color="neutral"
            size="xs"
            square={true}
            onClick={() => props.onDelete(props.block.id)}
            aria-label="Delete"
            title="Delete"
            class="!text-red-500 hover:!text-red-600"
            leading={<RLSIcon name="trash" size="xs" />}
          />
        </div>

        {/* Block Editor Body (No border, no bg) */}
        <div class="w-full relative">
          {isLocked() && (
            <div class="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-200/50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300 rounded text-xs mb-2 select-none border border-default">
              🔒 Templated Block (Locked)
            </div>
          )}
          <div class="w-full">{renderEditorComponent(props.block, props.sectionDepth || 0)}</div>
        </div>
      </div>
    </div>
  )
}
