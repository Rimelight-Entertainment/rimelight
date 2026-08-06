import type { BaseBlock } from "../../core/types/blocks"
import { initSplitPane } from "../utils/splitpane"

void import("./rimelight-contenteditable")
void import("./rimelight-block")
void import("./rimelight-preview")
void import("./rimelight-editor")

interface RimelightEditorElement extends HTMLElement {
  setBlocks(blocks: BaseBlock[]): void
  getBlocks(): BaseBlock[]
}

interface RimelightPreviewElement extends HTMLElement {
  setBlocks(blocks: BaseBlock[]): void
}

export class RimelightEditorLayout extends HTMLElement {
  private editorEl!: RimelightEditorElement
  private previewEl!: RimelightPreviewElement

  connectedCallback() {
    this.className = "rimelight-cms-editor-container"
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

    // Load initial blocks from attribute
    const initialBlocksAttr = this.getAttribute("initial-blocks")
    if (initialBlocksAttr) {
      try {
        const initialBlocks = JSON.parse(initialBlocksAttr)
        this.setInitialBlocks(initialBlocks)
      } catch (e) {
        console.error("Failed to parse initial blocks:", e)
      }
    }
  }

  setInitialBlocks(blocks: BaseBlock[]) {
    if (this.editorEl && this.editorEl.setBlocks) {
      this.editorEl.setBlocks(blocks)
    }
    if (this.previewEl && this.previewEl.setBlocks) {
      this.previewEl.setBlocks(blocks)
    }
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
