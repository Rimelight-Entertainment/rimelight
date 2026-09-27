import { onSettled, createEffect, createMemo, Show, type Component } from "solid-js"
import type { BaseBlock } from "../../core/types/blocks"
import { createEditorState } from "../state/editor-store"
import { RimelightEditor } from "./RimelightEditor"
import { RimelightPreview } from "./RimelightPreview"
import { initSplitPane } from "../utils/splitpane"

export interface RimelightEditorLayoutProps {
  pageId?: string
  initialBlocks?: BaseBlock[] | string
  showInternalPreview?: boolean
  ref?: (el: any) => void
}

export const RimelightEditorLayout: Component<RimelightEditorLayoutProps> = (componentProps) => {
  let containerRef: HTMLDivElement | undefined = undefined
  let editorPaneRef: HTMLDivElement | undefined = undefined
  let previewPaneRef: HTMLDivElement | undefined = undefined
  let handleRef: HTMLDivElement | undefined = undefined

  let parsedInitialBlocks: BaseBlock[] = []
  if (typeof componentProps.initialBlocks === "string") {
    try {
      parsedInitialBlocks = JSON.parse(componentProps.initialBlocks)
    } catch {
      parsedInitialBlocks = []
    }
  } else if (Array.isArray(componentProps.initialBlocks)) {
    parsedInitialBlocks = componentProps.initialBlocks
  }

  const state = createEditorState(parsedInitialBlocks, componentProps.pageId || "default-page")

  // Snapshot of blocks as plain objects for the preview.
  const previewBlocks = createMemo<BaseBlock[]>(() => {
    const len = state.blocks.length
    const result: BaseBlock[] = []
    for (let i = 0; i < len; i++) {
      const blockObj = JSON.parse(JSON.stringify(state.blocks[i]))
      if (blockObj && typeof blockObj === "object") {
        result.push(blockObj)
      }
    }
    return result
  })

  createEffect(
    () => state.status(),
    (currentStatus) => {
      if (typeof document !== "undefined") {
        document.dispatchEvent(
          new CustomEvent("status-change", { detail: { status: currentStatus }, bubbles: true })
        )
      }
    }
  )

  createEffect(
    () => previewBlocks(),
    (rawBlocks) => {
      if (typeof document !== "undefined") {
        document.dispatchEvent(
          new CustomEvent("blocks-change", { detail: { blocks: rawBlocks }, bubbles: true })
        )
      }
    }
  )

  onSettled(() => {
    const publicMethods = {
      undo: () => state.undo(),
      redo: () => state.redo(),
      addBlock: (_type?: string) => state.openPicker(null, "after", 0),
      saveDraft: () => state.saveDraft(),
      togglePreview: () => {
        const next = !state.previewVisible()
        state.setPreviewVisible(next)
        if (typeof document !== "undefined") {
          document.dispatchEvent(
            new CustomEvent("preview-toggle", { detail: { visible: next }, bubbles: true })
          )
        }
        return next
      },
      getBlocks: () => JSON.parse(JSON.stringify(state.blocks)),
      setBlocks: (newBlocks: BaseBlock[]) => state.setBlocks(newBlocks),
      getAttribute: (attr: string) => (attr === "page-id" ? componentProps.pageId : null)
    }

    if (componentProps.ref) {
      componentProps.ref(publicMethods)
    }

    if (typeof window !== "undefined") {
      const win = window as Window & { cmsEditorLayout?: Record<string, any> }
      win.cmsEditorLayout = publicMethods
    }

    if (containerRef) {
      Object.assign(containerRef, publicMethods)
    }
  })

  createEffect(
    () => componentProps.showInternalPreview && state.previewVisible(),
    (shouldInit) => {
      if (shouldInit) {
        queueMicrotask(() => {
          if (containerRef && editorPaneRef && previewPaneRef && handleRef) {
            initSplitPane(containerRef, editorPaneRef, previewPaneRef, handleRef)
          }
        })
      }
    }
  )

  return (
    <div class="rimelight-cms-editor-container flex-1 w-full h-full flex">
      <div
        ref={containerRef}
        class="cms-split-layout w-full h-full flex flex-row overflow-hidden relative"
        id="cms-layout"
      >
        <div
          ref={editorPaneRef}
          style={{
            flex:
              componentProps.showInternalPreview && state.previewVisible() ? "0 0 50%" : "1 1 100%"
          }}
          class="flex flex-col h-full overflow-hidden w-full"
        >
          <RimelightEditor state={state} />
        </div>

        <Show when={componentProps.showInternalPreview && state.previewVisible()}>
          <div ref={handleRef} class="cms-resize-handle" id="cms-resize-handle">
            <div class="cms-resize-pill" />
          </div>
          <div
            ref={previewPaneRef}
            style={{ flex: "0 0 50%" }}
            class="flex flex-col h-full overflow-hidden border-l border-gray-800"
          >
            <RimelightPreview blocks={previewBlocks} />
          </div>
        </Show>
      </div>
    </div>
  )
}
