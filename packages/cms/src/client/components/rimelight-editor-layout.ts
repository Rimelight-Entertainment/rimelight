import type { BaseBlock } from "../../core/types/blocks"
import { initSplitPane } from "../utils/splitpane"

void import("./rimelight-contenteditable")
void import("./rimelight-block")
void import("./rimelight-preview")
void import("./rimelight-editor")

interface RimelightEditorElement extends HTMLElement {
  setBlocks(blocks: BaseBlock[]): void
  getBlocks(): BaseBlock[]
  undo(): void
  redo(): void
  addBlock(type?: string): void
  saveDraft(): void
}

interface RimelightPreviewElement extends HTMLElement {
  setBlocks(blocks: BaseBlock[]): void
}

export class RimelightEditorLayout extends HTMLElement {
  private editorEl!: RimelightEditorElement
  private previewEl!: RimelightPreviewElement
  private cachedInitialBlocks: BaseBlock[] | null = null

  connectedCallback() {
    this.classList.add("rimelight-cms-editor-container", "flex-1", "w-full", "h-full", "flex")
    this.innerHTML = `
      <div class="cms-split-layout" id="cms-layout">
        <rimelight-editor id="cms-editor-component"></rimelight-editor>
        <div class="cms-resize-handle" id="cms-resize-handle"></div>
        <rimelight-preview id="cms-preview-component"></rimelight-preview>
      </div>
    `

    const container = this.querySelector<HTMLElement>("#cms-layout")
    const editorComponent = this.querySelector<RimelightEditorElement>("#cms-editor-component")
    const previewComponent = this.querySelector<RimelightPreviewElement>("#cms-preview-component")
    const handle = this.querySelector<HTMLElement>("#cms-resize-handle")

    if (editorComponent && previewComponent) {
      this.editorEl = editorComponent
      this.previewEl = previewComponent

      const pageId = this.getAttribute("page-id")
      if (pageId && this.editorEl.setAttribute) {
        this.editorEl.setAttribute("page-id", pageId)
      }
    }

    if (container && this.editorEl && this.previewEl && handle) {
      initSplitPane(container, this.editorEl, this.previewEl, handle)
    }

    this.editorEl?.addEventListener("editor-change", (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.blocks) {
        const blocks: BaseBlock[] = e.detail.blocks
        this.previewEl.setBlocks(blocks)
      }
    })

    this.editorEl?.addEventListener("status-change", (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.status) {
        this.dispatchEvent(
          new CustomEvent("status-change", { detail: { status: e.detail.status }, bubbles: true })
        )
      }
    })

    // Default preview pane to hidden on load
    this.setPreviewVisible(false)

    // Load initial blocks from attribute if present
    const initialBlocksAttr = this.getAttribute("initial-blocks")
    if (initialBlocksAttr) {
      try {
        const initialBlocks = JSON.parse(initialBlocksAttr)
        this.setInitialBlocks(initialBlocks)
      } catch (e) {
        console.error("Failed to parse initial blocks:", e)
      }
    } else if (this.cachedInitialBlocks) {
      this.setInitialBlocks(this.cachedInitialBlocks)
    }
  }

  setInitialBlocks(blocks: BaseBlock[]) {
    this.cachedInitialBlocks = blocks
    if (this.editorEl && typeof this.editorEl.setBlocks === "function") {
      this.editorEl.setBlocks(blocks)
    }
    if (this.previewEl && typeof this.previewEl.setBlocks === "function") {
      this.previewEl.setBlocks(blocks)
    }
  }

  private isPreviewVisible = false

  togglePreview(): boolean {
    this.setPreviewVisible(!this.isPreviewVisible)
    return this.isPreviewVisible
  }

  setPreviewVisible(visible: boolean) {
    this.isPreviewVisible = visible
    const handle = this.querySelector<HTMLElement>("#cms-resize-handle")
    const preview = this.querySelector<HTMLElement>("#cms-preview-component")

    if (handle) handle.style.display = visible ? "block" : "none"
    if (preview) {
      preview.style.display = visible ? "flex" : "none"
      if (visible) {
        preview.style.flex = "0 0 50%"
      }
    }
    if (this.editorEl) {
      this.editorEl.style.flex = visible ? "0 0 50%" : "1 1 100%"
    }

    this.dispatchEvent(new CustomEvent("preview-toggle", { detail: { visible }, bubbles: true }))
  }

  undo() {
    this.editorEl?.undo()
  }

  redo() {
    this.editorEl?.redo()
  }

  addBlock(type?: string) {
    this.editorEl?.addBlock(type)
  }

  saveDraft() {
    this.editorEl?.saveDraft()
  }

  async getBlocks(): Promise<BaseBlock[]> {
    if (this.editorEl && this.editorEl.getBlocks) {
      return this.editorEl.getBlocks()
    }
    return []
  }
}

if (!customElements.get("rimelight-editor-layout")) {
  customElements.define("rimelight-editor-layout", RimelightEditorLayout)
}
